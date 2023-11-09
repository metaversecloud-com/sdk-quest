export default (message, e, res) => {
  if (e && e.data && e.data.errors) console.error(`Error Obj: ${message}`, e?.data?.errors);
  // else
  console.error(`Error: ${message}`, e);
  if (res) res.status(500).send({ error: e, success: false });
  return { error: e };
};
