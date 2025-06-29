const asyncHandler = (handleRequest) => {
  return (req, resp, next) => {
    Promise.resolve(handleRequest(req, resp, next)).reject((error) =>
      next(error)
    );
  };
};

export default asyncHandler;
