import { useEffect, useState } from "react";

// Hình dạng của một task, phải khớp với JSON mà Backend trả về.
// Đây chính là "hợp đồng" giữa Frontend và Backend.
type Task = {
  id: number;
  title: string;
  done: boolean;
};


// Địa chỉ server. Frontend chỉ cần biết địa chỉ này, không cần biết server lưu dữ liệu ở đâu.
const API = 'http://localhost:3000/task';

export default function App() {
  // <Task[]> báo cho TypeScript biết đây là mảng các Task.
  // Thiếu nó thì [] bị hiểu là mảng rỗng không chứa gì, và setTasks sẽ báo lỗi.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState(''); 

  // GET: chạy 1 lần khi giao diện vừa hiện lên (mảng [] = chỉ chạy lần đầu).
  // Giống hệt bấm Send GET trong Postman.
  useEffect(() => {
    // Hàm bên trong useEffect không được khai báo async trực tiếp,
    // nên ta tạo hàm async riêng rồi gọi nó.
    async function load() {
      const res = await fetch(API); // gửi request, đợi server trả lời
      const data: Task[] = await res.json(); // đọc phần JSON trong response
      setTasks(data); // đưa vào state
    }
    load();
  }, []);

  // POST: giống hệt Postman: chọn POST, Body dạng JSON, header Content-Type.
  async function addTask() {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }), // biến object thành chuỗi JSON để gửi đi
    });

    // fetch KHÔNG tự báo lỗi khi server trả 400/500, phải tự kiểm tra res.ok.
    // Ví dụ title rỗng: ValidationPipe bên Nest trả 400 và ở đây sẽ vào nhánh này.
    if (!res.ok) return alert('Server báo lỗi, kiểm tra lại dữ liệu nhập');

    const newTask: Task = await res.json(); // task mới mà Backend vừa tạo
    setTasks([...tasks, newTask]); // cập nhật giao diện
    setTitle('');
  }

  return (
    <div>
      <h1>Danh sách việc cần làm</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onClick={addTask}>Thêm</button>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}