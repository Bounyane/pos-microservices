// Validation middleware for request data

// Validate login data
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }
  
  next();
};

// Validate token validation request
const validateTokenRequest = (req, res, next) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ 
      error: 'Token is required' 
    });
  }
  
  next();
};


// Sanitize user input
const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  
  if (req.body.role) {
    req.body.role = req.body.role.trim().toLowerCase();
  }
  
  if (req.body.uid) {
    req.body.uid = req.body.uid.trim();
  }
  
  next();
};

module.exports = {
  validateLogin,
  validateTokenRequest,
  sanitizeInput
}; 