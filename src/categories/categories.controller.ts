import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from 'src/users/decorators/public.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param(':id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(createCategoryDto, req.user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    const category = await this.categoriesService.findById(id);
    if (category.createdBy && category.createdBy.toString() !== req.user.id) {
      throw new UnauthorizedException(
        'You can only update your own categories',
      );
    }
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const category = await this.categoriesService.findById(id);
    if (
      category.createdBy &&
      category.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      throw new UnauthorizedException(
        'You can only delete your own categories',
      );
    }
    return this.categoriesService.delete(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  findAllAdmin() {
    return this.categoriesService.findAll();
  }
}
