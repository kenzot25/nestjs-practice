import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostNotFoundException } from './exceptions/postNotFound.exception';
import PostEntity from './post.entity';
import { Post } from './types/posts.interface';
import PostsSearchService from './postsSearch.service';
import { PostSearchBody, PostSearchResult } from './types/postSearch.interface';

@Injectable()
export default class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    private readonly postSearchService: PostsSearchService,
  ) {}

  getAllPosts() {
    return this.postsRepository.find({
      relations: ['author', 'categories'],
    });
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['author'],
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
      relations: ['author'],
    });
    if (updatedPost) {
      await this.postSearchService.update(updatedPost);
      return updatedPost;
    }
    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDto, user: User) {
    const newPost = await this.postsRepository.save({ ...post, author: user });
    this.postSearchService.indexPost(newPost);
    return newPost;
  }

  async deletePost(id: number) {
    const result = await this.postsRepository.delete(id);
    if (!result.affected) {
      throw new PostNotFoundException(id);
    }
    await this.postSearchService.remove(id);
  }

  async searchForPosts(text: string) {
    const results = await this.postSearchService.search(text);
    const ids = results.map((result: PostSearchBody) => result.id);
    if (!ids.length) {
      return [];
    }
    return this.postsRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
}
