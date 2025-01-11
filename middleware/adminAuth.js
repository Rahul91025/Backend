import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    // Check if the token is present
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Decode the token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // Validate token payload
    if (
      token_decode.email !== process.env.ADMIN_EMAIL ||
      token_decode.password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Attach decoded data to the request for use in the next middleware or route
    req.admin = token_decode;
    next();
  } catch (err) {
    console.error(err);

    // Handle token-specific errors
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired. Please log in again." });
    }

    return res.status(401).json({ message: "Invalid token or not authorized" });
  }
};

export default adminAuth;
