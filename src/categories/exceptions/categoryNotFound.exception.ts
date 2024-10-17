import { NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`The category with id ${id} does not exits.`);
  }
}
