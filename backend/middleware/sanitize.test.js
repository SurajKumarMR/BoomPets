const sanitizeInput = require('./sanitize');

describe('Input Sanitization', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should sanitize NoSQL injection in body', () => {
    req.body = {
      email: 'test@example.com',
      password: { $gt: '' },
    };

    sanitizeInput(req, res, next);

    expect(req.body.password).toEqual({ _gt: '' });
    expect(next).toHaveBeenCalled();
  });

  it('should sanitize dollar signs in nested objects', () => {
    req.body = {
      user: {
        $where: 'malicious code',
      },
    };

    sanitizeInput(req, res, next);

    expect(req.body.user._where).toBe('malicious code');
    expect(req.body.user.$where).toBeUndefined();
  });

  it('should sanitize query parameters', () => {
    req.query = {
      filter: { $ne: null },
    };

    sanitizeInput(req, res, next);

    expect(req.query.filter._ne).toBe(null);
  });

  it('should allow normal input', () => {
    req.body = {
      email: 'test@example.com',
      name: 'John Doe',
      age: 25,
    };

    const originalBody = { ...req.body };
    sanitizeInput(req, res, next);

    expect(req.body).toEqual(originalBody);
    expect(next).toHaveBeenCalled();
  });
});
