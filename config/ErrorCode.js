module.exports = {
    REQUEST_TIMEOUT: {
      code: 500,
      codeError: 'REQUEST_TIMEOUT',
      message: 'Request Timeout',
      type: 'INTERNAL'
    },
    INVALID_PARAMETER: {
      code: 400,
      codeError: 'INVALID_PARAMETER',
      message: 'Invalid Parameter',
      type: 'BAD_REQUEST'
    },
    WRONG_PARAMETER: {
      code: 401,
      codeError: 'WRONG_PARAMETER',
      message: 'Wrong Parameter',
      type: 'BAD_REQUEST'
    },
    EXISTS_INPUT_INFO: {
      code: 402,
      codeError: 'EXISTS_INPUT_INFO',
      message: 'Exists Input Info',
      type: 'BAD_REQUEST'
    },
    TOKEN_EXPIRED: {
      code: 403,
      codeError: 'TOKEN_EXPIRED',
      message: 'Token Expired',
      type: 'BAD_REQUEST'
    },
    INACTIVE_ACCOUNT: {
      code: 300,
      codeError: 'INACTIVE_ACCOUNT',
      message: 'Inactive Account',
      type: 'BAD_REQUEST'
    },
  };