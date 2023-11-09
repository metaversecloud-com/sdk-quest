export const error = (message, e, res) => {
  if (e && e.data && e.data.errors) console.log(`Error Obj: ${message}`, e?.data?.errors);
  else console.log(`Error: ${message}`, e);
  if (res) res.status(500).send({ error: e, success: false });
  return { error: e };
};
