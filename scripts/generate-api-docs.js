#!/usr/bin/env node

/**
 * JSDoc에서 OpenAPI/Swagger 문서 자동 생성
 * 
 * 기능:
 * 1. TypeScript 파일에서 JSDoc 주석 추출
 * 2. OpenAPI 3.0 스펙 생성
 * 3. Swagger UI 호환 JSON/YAML 생성
 * 4. Postman Collection 생성
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// API 엔드포인트 스캔 패턴
const API_PATTERNS = [
  'apps/web/src/app/api/**/*.ts',
  'apps/api/src/**/*.ts'
];

// OpenAPI 기본 구조
const OPENAPI_BASE = {
  openapi: '3.0.3',
  info: {
    title: 'Mini Notion API',
    description: '실시간 협업 에디터 API',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@mini-notion.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: '개발 서버'
    },
    {
      url: 'https://api.mini-notion.com/api',
      description: '프로덕션 서버'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {}
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {}
};

async function scanApiFiles() {
  console.log('🔍 API 파일 스캔 중...');
  
  const files = [];
  
  for (const pattern of API_PATTERNS) {
    const matches = glob.sync(pattern);
    files.push(...matches);
  }
  
  console.log(`📁 발견된 API 파일: ${files.length}개`);
  return files;
}

function extractJSDocFromFile(filePath) {
  console.log(`📖 JSDoc 추출: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const endpoints = [];
  
  // JSDoc 주석 패턴 매칭
  const jsdocPattern = /\/\*\*\s*\n([\s\S]*?)\*\/\s*\n\s*export\s+async\s+function\s+(\w+)/g;
  
  let match;
  while ((match = jsdocPattern.exec(content)) !== null) {
    const [, jsdocContent, functionName] = match;
    
    // @swagger 태그 추출
    const swaggerMatch = jsdocContent.match(/@swagger\s*\n([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/)/);
    
    if (swaggerMatch) {
      const swaggerYaml = swaggerMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join('\n');
      
      try {
        const endpoint = parseSwaggerYaml(swaggerYaml, functionName, filePath);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      } catch (error) {
        console.warn(`⚠️ Swagger 파싱 오류 in ${filePath}:`, error.message);
      }
    }
  }
  
  return endpoints;
}

function parseSwaggerYaml(yamlContent, functionName, filePath) {
  // 간단한 YAML 파서 (실제로는 js-yaml 라이브러리 사용 권장)
  const lines = yamlContent.trim().split('\n');
  
  let currentPath = null;
  let currentMethod = null;
  let endpoint = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 경로 추출
    if (trimmed.startsWith('/')) {
      currentPath = trimmed.replace(':', '');
      continue;
    }
    
    // HTTP 메서드 추출
    if (['get', 'post', 'put', 'delete', 'patch'].includes(trimmed)) {
      currentMethod = trimmed;
      endpoint = {
        path: currentPath,
        method: currentMethod,
        operationId: functionName,
        summary: '',
        description: '',
        tags: [],
        parameters: [],
        requestBody: null,
        responses: {},
        security: []
      };
      continue;
    }
    
    // 속성 파싱
    if (endpoint && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key.trim()) {
        case 'summary':
          endpoint.summary = value;
          break;
        case 'description':
          endpoint.description = value;
          break;
        case 'tags':
          endpoint.tags = [value.replace(/[\[\]]/g, '')];
          break;
      }
    }
  }
  
  return endpoint;
}

function generateOpenAPISpec(endpoints) {
  console.log('📋 OpenAPI 스펙 생성 중...');
  
  const spec = { ...OPENAPI_BASE };
  
  // 엔드포인트별 경로 추가
  for (const endpoint of endpoints) {
    if (!spec.paths[endpoint.path]) {
      spec.paths[endpoint.path] = {};
    }
    
    spec.paths[endpoint.path][endpoint.method] = {
      operationId: endpoint.operationId,
      summary: endpoint.summary || `${endpoint.method.toUpperCase()} ${endpoint.path}`,
      description: endpoint.description || '',
      tags: endpoint.tags.length > 0 ? endpoint.tags : ['Default'],
      parameters: endpoint.parameters,
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { type: 'object' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad Request'
        },
        '401': {
          description: 'Unauthorized'
        },
        '403': {
          description: 'Forbidden'
        },
        '404': {
          description: 'Not Found'
        },
        '500': {
          description: 'Internal Server Error'
        }
      }
    };
    
    // 인증이 필요한 엔드포인트 표시
    if (!endpoint.path.includes('/auth/signin') && !endpoint.path.includes('/auth/signup')) {
      spec.paths[endpoint.path][endpoint.method].security = [{ bearerAuth: [] }];
    }
  }
  
  return spec;
}

function generatePostmanCollection(spec) {
  console.log('📮 Postman Collection 생성 중...');
  
  const collection = {
    info: {
      name: 'Mini Notion API',
      description: spec.info.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{accessToken}}',
          type: 'string'
        }
      ]
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3001/api',
        type: 'string'
      },
      {
        key: 'accessToken',
        value: '',
        type: 'string'
      }
    ],
    item: []
  };
  
  // 태그별로 폴더 생성
  const folders = {};
  
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const tag = operation.tags?.[0] || 'Default';
      
      if (!folders[tag]) {
        folders[tag] = {
          name: tag,
          item: []
        };
      }
      
      const request = {
        name: operation.summary,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            }
          ],
          url: {
            raw: '{{baseUrl}}' + path,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter(p => p)
          }
        }
      };
      
      // 인증 헤더 추가
      if (operation.security?.length > 0) {
        request.request.auth = {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{accessToken}}',
              type: 'string'
            }
          ]
        };
      }
      
      folders[tag].item.push(request);
    }
  }
  
  collection.item = Object.values(folders);
  return collection;
}

async function saveDocuments(spec, collection) {
  console.log('💾 문서 파일 저장 중...');
  
  // docs/api 디렉토리 생성
  const apiDocsDir = 'docs/api';
  if (!fs.existsSync(apiDocsDir)) {
    fs.mkdirSync(apiDocsDir, { recursive: true });
  }
  
  // OpenAPI JSON 저장
  const openApiPath = path.join(apiDocsDir, 'openapi.json');
  fs.writeFileSync(openApiPath, JSON.stringify(spec, null, 2));
  console.log(`✅ OpenAPI 스펙 저장: ${openApiPath}`);
  
  // OpenAPI YAML 저장 (간단한 변환)
  const yamlPath = path.join(apiDocsDir, 'openapi.yaml');
  const yamlContent = jsonToYaml(spec);
  fs.writeFileSync(yamlPath, yamlContent);
  console.log(`✅ OpenAPI YAML 저장: ${yamlPath}`);
  
  // Postman Collection 저장
  const postmanPath = path.join(apiDocsDir, 'postman-collection.json');
  fs.writeFileSync(postmanPath, JSON.stringify(collection, null, 2));
  console.log(`✅ Postman Collection 저장: ${postmanPath}`);
  
  return [openApiPath, yamlPath, postmanPath];
}

function jsonToYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${spaces}${key}: null\n`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      yaml += jsonToYaml(value, indent + 1);
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      for (const item of value) {
        if (typeof item === 'object') {
          yaml += `${spaces}  -\n`;
          yaml += jsonToYaml(item, indent + 2);
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      }
    } else {
      yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  return yaml;
}

// 메인 실행 함수
async function main() {
  console.log('🚀 API 문서 자동 생성 시작');
  
  try {
    // 1. API 파일 스캔
    const apiFiles = await scanApiFiles();
    
    if (apiFiles.length === 0) {
      console.log('⚠️ API 파일을 찾을 수 없습니다.');
      return;
    }
    
    // 2. JSDoc 추출
    const allEndpoints = [];
    for (const file of apiFiles) {
      const endpoints = extractJSDocFromFile(file);
      allEndpoints.push(...endpoints);
    }
    
    console.log(`📊 추출된 엔드포인트: ${allEndpoints.length}개`);
    
    // 3. OpenAPI 스펙 생성
    const spec = generateOpenAPISpec(allEndpoints);
    
    // 4. Postman Collection 생성
    const collection = generatePostmanCollection(spec);
    
    // 5. 파일 저장
    const savedFiles = await saveDocuments(spec, collection);
    
    console.log('✅ API 문서 생성 완료!');
    console.log('📄 생성된 파일:');
    savedFiles.forEach(file => console.log(`   - ${file}`));
    
  } catch (error) {
    console.error('❌ API 문서 생성 중 오류:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  scanApiFiles,
  extractJSDocFromFile,
  generateOpenAPISpec,
  generatePostmanCollection
};