import { HttpException, Injectable } from '@nestjs/common';
import Category from './category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryNotFoundException } from './exceptions/categoryNotFound.exception';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  getAllCategories() {
    return this.categoriesRepository.find({
      relations: ['posts'],
    });
  }
  async createCategories(name: string) {
    const newCategory = this.categoriesRepository.create({ name });
    await this.categoriesRepository.save(newCategory);
    return newCategory;
  }

  async getCategoryById(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
      },
    });
    if (category) {
      return category;
    }
    throw new CategoryNotFoundException(id);
  }

  async updateCategory(id: number, category: UpdateCategoryDto) {
    const result = await this.categoriesRepository.update(id, category);
    if (!result.affected) {
      throw new CategoryNotFoundException(id);
    }
    return this.categoriesRepository.findOne({
      where: {
        id,
      },
      relations: ['posts'],
    });
  }
}
