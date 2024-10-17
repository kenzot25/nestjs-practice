import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/authentication/guards/jwt.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @UseGuards(JwtGuard)
  getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Post()
  @UseGuards(JwtGuard)
  createCategory(@Body() body: CreateCategoryDto) {
    return this.categoriesService.createCategories(body.name);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getCategory(@Param('id') id: number) {
    return this.categoriesService.getCategoryById(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  updateCategory(@Param('id') id: number, @Body() category: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, category);
  }
}
