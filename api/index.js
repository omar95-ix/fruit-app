export default function handler(req, res) {
  res.status(200).json({
    message: 'Fruit App API - Serverless',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        get: 'GET /api/products/[id]',
        update: 'PUT /api/products/[id]',
        delete: 'DELETE /api/products/[id]'
      },
      attributes: {
        list: 'GET /api/attributes',
        create: 'POST /api/attributes'
      },
      upload: {
        media: 'POST /api/upload/media'
      }
    }
  });
}
