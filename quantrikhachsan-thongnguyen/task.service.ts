import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TaskService {
  // "Cơ sở dữ liệu" tạm: một mảng nằm trong RAM của server.
  // Chỉ sống khi server còn chạy. Tắt server là mất sạch.
  private tasks = [{ id: 1, title: 'Học NestJS', done: false }];

  create(dto: CreateTaskDto) {
    const task = { id: Date.now(), title: dto.title, done: false };
    this.tasks.push(task);
    return task; // trả task mới về cho React hiển thị
  }

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
