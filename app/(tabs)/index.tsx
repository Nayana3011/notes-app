import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from '../../src/services/noteService';

type Note = {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
};

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const data = await getNotes();
      setNotes(data ?? []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!title.trim()) {
      return;
    }

    try {
      const newNote = await createNote(
        title.trim(),
        content.trim()
      );

      setNotes((currentNotes) => [
        newNote,
        ...currentNotes,
      ]);

      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }

  async function handleDeleteNote(id: number) {
    try {
      await deleteNote(id);

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== id)
      );
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  async function handleUpdateNote() {
    if (editingId === null || !title.trim()) {
      return;
    }

    try {
      const updatedNote = await updateNote(
        editingId,
        title.trim(),
        content.trim()
      );

      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === editingId ? updatedNote : note
        )
      );

      setTitle('');
      setContent('');
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Notes</Text>

      <TextInput
        style={styles.input}
        placeholder="Note title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="Write your note..."
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={
          editingId === null
            ? handleAddNote
            : handleUpdateNote
        }
      >
        <Text style={styles.buttonText}>
          {editingId === null ? 'Add Note' : 'Update Note'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.noteCard}>
              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.content}>
                {item.content}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingId(item.id);
                  setTitle(item.title);
                  setContent(item.content ?? '');
                }}
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNote(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },

  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    marginBottom: 20,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  noteCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  content: {
    fontSize: 15,
  },

  deleteButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#ddd',
  },

  deleteText: {
    fontWeight: 'bold',
  },

  editButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
});