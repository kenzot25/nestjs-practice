import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Post } from './posts.interface';
import { UpdatePostDto } from './dto/updatePost.dto';
import { CreatePostDto } from './dto/createPost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import PostEntity from './post.entity';
import { Repository } from 'typeorm';
import { PostNotFoundException } from './exceptions/postNotFound.exception';

@Injectable()
export default class PostsService {
  private lastPostId = 0;
  private posts: Post[] = [];

  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  getAllPosts() {
    return this.postsRepository.find();
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });
    if (post) return post;
    throw new PostNotFoundException(id);
  }

  async updatePost(id: number, post: UpdatePostDto) {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne({
      where: {
        id,
      },
    });
    if (updatedPost) return updatedPost;
    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDto) {
    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async deletePost(id: number) {
    const result = await this.postsRepository.delete(id);
    if (!result.affected) {
      throw new PostNotFoundException(id);
    }
  }
}
