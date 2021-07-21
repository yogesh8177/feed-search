import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BlogService } from '../Services/blog.service';
import { Blog } from '../models/Blog';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Component({
    selector: 'blog-page',
    templateUrl: './blog-page.component.html',
    styleUrls: [
      '../app.component.scss', 
      '../feed-card/feed-card.component.scss',
      '../live-match/live-match.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
  })
export class BlogPageComponent implements OnInit {
    blog: Blog;
    slug: string;
    safeHTML: SafeHtml;

    constructor(
      private blogService: BlogService,
      private route: ActivatedRoute,
      private sanitizer: DomSanitizer
    ){}

    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.slug = params['slug'] || '';
        this.blogService.getBlog(this.slug).subscribe(blogResponse => {
          this.blog = blogResponse;
          this.safeHTML = this.sanitizer.bypassSecurityTrustHtml(this.blog.content);
        });
        // this.blog = this.blogService.getBlog(this.slug) as Blog;
        // console.log({content: this.blog.content});
        // this.safeHTML = this.sanitizer.bypassSecurityTrustHtml(this.blog.content);
      });
    }
}
