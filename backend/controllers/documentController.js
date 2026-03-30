let documents = []; // temporary storage
let idCounter = 1;

const getAllDocs = (req, res) => {
  res.json(documents);
};

const getDocById = (req, res) => {
  const id = parseInt(req.params.id);
  const doc = documents.find(d => d.id === id);
  if (doc) res.json(doc);
  else res.status(404).json({ message: 'Document not found' });
};

const createDoc = (req, res) => {
  const { title, content } = req.body;
  const newDoc = { id: idCounter++, title, content };
  documents.push(newDoc);
  res.status(201).json(newDoc);
};

const updateDoc = (req, res) => {
  const id = parseInt(req.params.id);
  const doc = documents.find(d => d.id === id);
  if (doc) {
    const { title, content } = req.body;
    if (title) doc.title = title;
    if (content) doc.content = content;
    res.json(doc);
  } else {
    res.status(404).json({ message: 'Document not found' });
  }
};

const deleteDoc = (req, res) => {
  const id = parseInt(req.params.id);
  const index = documents.findIndex(d => d.id === id);
  if (index !== -1) {
    documents.splice(index, 1);
    res.json({ message: 'Document deleted successfully' });
  } else {
    res.status(404).json({ message: 'Document not found' });
  }
};

module.exports = {
  getAllDocs,
  getDocById,
  createDoc,
  updateDoc,
  deleteDoc
};