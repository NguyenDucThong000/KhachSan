# Nối Backend NestJS vào MySQL — Giải thích từng bước cho người mới

Tài liệu này dành cho sinh viên **chưa quen** với backend, chỉ cần biết
HTML/JS cơ bản và đã nghe qua "API trả JSON". Đọc xong bạn sẽ hiểu vì
sao phải sửa đúng 4 file này, không hơn không kém.

## Trước tiên: vấn đề là gì?

Hãy tưởng tượng server giống một cái **quầy phục vụ**. Khi app React
(`App.tsx`) gọi `fetch('http://localhost:3000/task')`, giống như bạn
đến quầy hỏi "cho tôi xem danh sách task". Quầy phải lấy danh sách đó
từ đâu đó để trả lời.

Trước khi sửa, danh sách task được lưu trong **một biến JavaScript**:

```ts
private tasks = [{ id: 1, title: 'Học NestJS', done: false }];
```

Biến này sống trong RAM của máy — giống như viết lên **tấm bảng
trắng**. Viết xong rất nhanh, nhưng **tắt server (xóa bảng) là mất
sạch**. Mai mở lại server, danh sách lại chỉ còn đúng 1 task mặc định.

Việc cần làm: thay tấm bảng trắng đó bằng một **cuốn sổ thật, lưu
ngoài server** — chính là MySQL. Tắt server, mở lại, dữ liệu vẫn còn.

## Một điều hay gây hiểu lầm

Trong file `src/app.module.ts`, đã có sẵn đoạn khai báo "địa chỉ nhà
MySQL":

```ts
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'taskdb',
}),
```

Nhiều người nghĩ: "có đoạn này rồi thì chắc app đang lưu vào MySQL
rồi". **Sai.** Đoạn này chỉ giống như **lưu số điện thoại của MySQL
vào danh bạ** — app biết cách liên lạc tới MySQL, nhưng **chưa ai gọi
điện cả**. `TaskService` vẫn đang tự lưu vào tấm bảng trắng riêng của
nó, chưa hề "gọi điện" cho MySQL. Đây là lỗi hay gặp nhất khi mới học.

Việc mình làm tiếp theo là làm cho `TaskService` thật sự "gọi điện" —
tức là đọc/ghi dữ liệu vào MySQL mỗi khi có request tới.

## Bước 1 — Vẽ lại "cái sổ" sẽ lưu trong MySQL (Entity)

MySQL lưu dữ liệu theo **bảng** (table), giống một file Excel: có các
cột, mỗi dòng là 1 record. Trước khi lưu được, phải định nghĩa bảng đó
trông như thế nào. Trong NestJS, việc này gọi là viết **Entity**.

File `src/task/entities/task.entity.ts`:

```ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;          // cột id, tự tăng 1, 2, 3...

  @Column()
  title: string;       // cột tên công việc

  @Column({ default: false })
  done: boolean;       // cột đã xong chưa, mặc định là chưa (false)

  @CreateDateColumn()
  createdAt: Date;      // cột ngày tạo, tự động điền
}
```

Có thể hiểu class `Task` này như **bản thiết kế cột trong Excel**:
mỗi `@Column()` là một cột. TypeORM (thư viện giúp NestJS nói chuyện
với MySQL) sẽ đọc bản thiết kế này và tự tạo bảng `task` thật trong
MySQL — bạn không cần tự gõ lệnh SQL `CREATE TABLE`.

**Vì sao chọn tên cột `done: boolean` chứ không phải `status: string`?**
Vì bên React (`App.tsx`) đã viết sẵn:

```ts
type Task = {
  id: number;
  title: string;
  done: boolean;
};
```

Frontend và Backend phải "nói cùng một loại JSON" — ví như hai người
nhắn tin phải dùng chung một loại từ viết tắt thì mới hiểu nhau. Nếu
Backend trả về `status: "OPEN"` mà Frontend chỉ biết đọc `done`, giao
diện sẽ không hiển thị đúng. Nên ta chỉnh Entity cho khớp với cái
Frontend đang mong đợi, thay vì sửa ngược lại Frontend.

## Bước 2 — Cho phép module "task" mượn cuốn sổ đó

File `src/task/task.module.ts`:

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
```

Ở Bước 1 ta mới "thiết kế" cái bảng. Dòng `forFeature([Task])` này
giống như nói với NestJS: "module `task` này sẽ được dùng bảng `Task`
đó nhé, chuẩn bị sẵn công cụ đọc/ghi nó cho tôi". Thiếu dòng này, bước
sau (gọi `@InjectRepository`) sẽ báo lỗi vì NestJS chưa biết phải lấy
công cụ đọc/ghi từ đâu.

## Bước 3 — Dạy cho `TaskService` cách đọc/ghi MySQL thật

Đây là bước quan trọng nhất. File `src/task/task.service.ts` trước đây:

```ts
// TRƯỚC — tấm bảng trắng, mất khi tắt server
private tasks = [{ id: 1, title: 'Học NestJS', done: false }];

create(dto) {
  const task = { id: Date.now(), title: dto.title, done: false };
  this.tasks.push(task);
  return task;
}

findAll() {
  return this.tasks;
}
```

Sau khi sửa:

```ts
// SAU — "taskRepository" là công cụ giúp đọc/ghi bảng task trong MySQL
constructor(
  @InjectRepository(Task)
  private readonly taskRepository: Repository<Task>,
) {}

create(dto: CreateTaskDto) {
  const task = this.taskRepository.create({ title: dto.title, done: false });
  return this.taskRepository.save(task); // save() = lệnh INSERT thật vào MySQL
}

findAll() {
  return this.taskRepository.find(); // find() = lệnh SELECT * FROM task
}
```

`taskRepository` ("repository" = nơi lưu trữ) là một công cụ có sẵn
các hàm quen thuộc, mỗi hàm tương ứng 1 câu lệnh SQL mà bạn không cần
tự gõ:

| Gọi trong code | Tương đương SQL | Ý nghĩa |
|---|---|---|
| `repo.find()` | `SELECT * FROM task` | lấy hết danh sách |
| `repo.findOneBy({ id })` | `SELECT * FROM task WHERE id = ?` | lấy 1 task |
| `repo.save(task)` | `INSERT INTO task ...` | thêm mới |
| `repo.update(id, dto)` | `UPDATE task SET ... WHERE id = ?` | sửa |
| `repo.delete(id)` | `DELETE FROM task WHERE id = ?` | xoá |

**Lưu ý hay nhầm:** `repo.create({...})` chỉ tạo ra 1 object JavaScript
tạm trong bộ nhớ, **chưa lưu vào MySQL**. Giống như bạn viết nháp ra
giấy. Phải gọi thêm `repo.save(...)` thì dữ liệu mới thực sự được ghi
vào MySQL — giống như bỏ giấy nháp đó vào tủ hồ sơ thật.

**Điều thú vị:** file `task.controller.ts` (nơi nhận request từ
frontend) **không cần sửa gì cả**. Vì controller chỉ gọi
`this.taskService.findAll()` — nó không quan tâm bên trong `findAll()`
đang đọc từ tấm bảng trắng hay từ MySQL. Đây là lợi ích của việc tách
code thành nhiều lớp: đổi "ruột" bên trong mà bên ngoài không cần biết.

## Bước 4 — Cho phép đánh dấu "đã xong"

File `src/task/dto/update-task.dto.ts` được thêm field `done`:

```ts
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
```

`DTO` (Data Transfer Object) chỉ là **một cái khuôn kiểm tra dữ liệu
gửi lên có đúng định dạng không**. Thêm `done?: boolean` để khi
frontend gửi `PATCH /task/1` với nội dung `{ "done": true }`, NestJS
biết đây là hợp lệ và chuyển xuống cho Service xử lý.

## Toàn bộ đường đi của 1 request, từ đầu đến cuối

```
Người dùng bấm nút trên App.tsx
        │  fetch('http://localhost:3000/task', { method: 'POST', ... })
        ▼
TaskController (nhận request, kiểm tra URL + method)
        │  gọi taskService.create(dto)
        ▼
TaskService (xử lý nghiệp vụ)
        │  gọi taskRepository.save(task)
        ▼
TypeORM Repository (dịch thành câu lệnh SQL)
        │  INSERT INTO task (title, done) VALUES (...)
        ▼
MySQL (lưu thật, nằm trên ổ cứng máy bạn)
        │  trả về dòng vừa thêm, có id thật
        ▼
... đi ngược lại lên Controller → trả JSON về cho App.tsx
```

## Thử chạy thật

1. Mở MySQL (trên Windows là service `MySQL80`, cần đang ở trạng thái
   **Running**).
2. Chạy `npm run start:dev` trong thư mục backend.
3. Mở `App.tsx` (chạy riêng bằng một project React/Vite), bấm nút
   "Thêm" để tạo task.
4. Tắt server NestJS, mở lại, gọi lại `GET /task` — task vẫn còn, vì
   giờ nó nằm trong MySQL, không còn nằm trong RAM nữa.

Có thể tự kiểm tra bằng tay (không qua giao diện) bằng `curl`:

```bash
curl -X POST http://localhost:3000/task -H "Content-Type: application/json" -d "{\"title\":\"Hoc MySQL\"}"
curl http://localhost:3000/task
```

## Vài câu hỏi sinh viên thường hỏi

**Vì sao không cần sửa gì ở App.tsx?**
Vì ngay từ Bước 1, ta đã đặt tên cột trong MySQL (`done: boolean`)
đúng với những gì App.tsx đã viết sẵn. Hai bên "nói cùng ngôn ngữ" nên
không cần sửa bên nào thêm.

**`synchronize: true` trong app.module.ts là gì, có nên giữ không?**
Đây là tính năng tự động: mỗi lần chạy app, TypeORM so sánh Entity với
bảng thật trong MySQL rồi tự chỉnh bảng cho khớp (tự thêm/xoá cột).
Rất tiện khi học, vì không cần tự viết SQL. Nhưng trong công ty thật,
tính năng này **nguy hiểm** — có thể tự xoá nhầm cột đang chứa dữ liệu
quan trọng. Dự án thật dùng "migration" (một kiểu "biên bản thay đổi
bảng" được viết tay, kiểm duyệt rồi mới chạy) thay cho `synchronize`.

**Sao lại để mật khẩu MySQL (`123456`) thẳng trong code, không nguy
hiểm sao?**
Có, nếu đẩy code này lên GitHub công khai, ai cũng thấy mật khẩu. Ở
đây để vậy cho đơn giản vì đang học, chạy trên máy cá nhân. Cách làm
đúng trong công việc thật là lưu mật khẩu trong một file riêng tên
`.env` (không đưa lên Git), rồi dùng gói `@nestjs/config` để đọc vào —
phần này có thể học ở bài sau.

**Vì sao 2 file test (`*.spec.ts`) cũng bị sửa?**
Vì trước đây test tạo `TaskService` không cần gì thêm. Giờ
`TaskService` cần một "công cụ đọc/ghi MySQL" (Repository) mới chạy
được. Nhưng khi test, ta **không muốn** phải mở MySQL thật — nên ta
đưa vào một "công cụ giả" (gọi là *mock*, nghĩa là hàng giả lập dùng
để test) chỉ biết trả lời "ok" mà không đụng tới MySQL thật. Nhờ vậy
test chạy nhanh và không phụ thuộc máy có MySQL hay không.
