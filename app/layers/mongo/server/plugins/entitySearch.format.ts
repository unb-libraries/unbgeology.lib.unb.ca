export default defineEntityFormatter<{ _score: number }>((doc, options) => {
  if (!(`model` in options || `_score` in doc)) {
    return {}
  }

  const { _score } = doc
  return {
    score: _score,
  }
})
