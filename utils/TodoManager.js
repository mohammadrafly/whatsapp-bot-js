class TodoManager {
  constructor(client, db) {
    this.client = client;
    this.db = db;
  }

  addTodoWithReminder(message) {
    const userNumber = message.from;
    const [, title, description, time, date, month, year] = message.body.split('/');
    const created_at = new Date().toISOString();

    if (!title || !description || !time || !date || !month || !year) {
      const errorMessage = 'Semua kolom harus diisi.';
      this.client.sendMessage(userNumber, errorMessage);
      return;
    }

    const sanitizedUserNumber = userNumber.replace(/[@.]/g, '_');
    const sender = message.from;
    const task = { title, description, time, date, month, year, sender, created_at };

    this.saveTodoToFirebase(sanitizedUserNumber, task)
      .then(() => {
        const successMessage = 'Tugas berhasil ditambahkan:';
        const deadline = `${date}/${month}/${year} - ${time}`;
        const newTaskMessage = `Judul: ${title}\nDeskripsi: ${description}\nDeadline: ${deadline}`;
        const responseMessage = `${successMessage}\n${newTaskMessage}`;
        this.client.sendMessage(userNumber, responseMessage);
      })
      .catch((error) => {
        console.error('Error saving task to Firebase:', error);
        this.client.sendMessage(userNumber, 'Tidak dapat menyimpan tugas. Coba lagi nanti.');
      });
  }

  async listTodos(message) {
    try {
      const userNumber = message.from;

      const sanitizedUserNumber = userNumber.replace(/[@.]/g, '_');

      const tasks = await this.loadTodosFromFirebase(sanitizedUserNumber);

      if (!tasks || Object.keys(tasks).length === 0) {
        this.client.sendMessage(userNumber, 'Tidak ada tugas yang ditemukan.');
      } else {
        let messageText = 'Tugas Anda:\n';
        let taskNumber = 1;

        for (const taskId in tasks) {
          if (tasks.hasOwnProperty(taskId)) {
            const task = tasks[taskId];
            const taskTime = `${task.time} on ${task.date}/${task.month}/${task.year}`;
            const createdAt = new Date(task.created_at).toLocaleString();

            messageText += `${taskNumber}. ${task.title} (${taskTime}) - ${task.description}\n`;
            messageText += `   Dibuat pada: ${createdAt}\n`;

            taskNumber++;
          }
        }

        this.client.sendMessage(userNumber, messageText);
      }
    } catch (error) {
      console.error('Error loading tasks from Firebase:', error);
      this.client.sendMessage(userNumber, 'Gagal memuat daftar tugas. Coba lagi nanti.');
    }
  }

  saveTodoToFirebase(userNumber, todo) {
    const sanitizedUserNumber = userNumber.replace(/[@.]/g, '_');
    const userRef = this.db.ref(`users/${sanitizedUserNumber}/todos`);
    const newTodoRef = userRef.push();
    return newTodoRef.set(todo);
  }

  async loadTodosFromFirebase(userNumber) {
    const userRef = this.db.ref(`users/${userNumber}/todos`);
    const snapshot = await userRef.once('value');
    return snapshot.val();
  }
}

module.exports = TodoManager;
