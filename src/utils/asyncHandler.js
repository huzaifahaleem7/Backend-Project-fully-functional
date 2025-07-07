const asyncHandler = (handleRequest) => {
  return (req, resp, next) => {
    Promise.resolve(handleRequest(req, resp, next)).catch((error) =>
      next(error)
    );
  };
};

export default asyncHandler;
