export const errorHandler = ({ error, functionName, message, req, res }) => {
  try {

    const reqQueryParams = req?.query;
    if (reqQueryParams?.interactiveNonce) delete reqQueryParams.interactiveNonce;

    if (process.env.NODE_ENV === "development") console.log("❌ Error:", error);
    else {
      console.error(
        JSON.stringify({
          errorContext: {
            message,
            functionName,
          },
          requestContext: {
            requestId: req?.id,
            reqQueryParams,
            reqBody: req?.body,
          },
          error: JSON.stringify(error),
        }),
      );
    }

    if (res) return res.status(error.status || 500).send({ error, message, success: false });
    return { error };
  } catch (e) {
    console.error("❌ Error printing the logs", e);
    if (res) return res.status(500).send({ error: e, message, success: false });
    return { e };
  }
};
