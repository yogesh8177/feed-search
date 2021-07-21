import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BlogService } from '../Services/blog.service';
import { Blog } from '../models/Blog';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer, SafeHtml, Meta, MetaDefinition } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
    selector: 'blog-page',
    templateUrl: './blog-page.component.html',
    styleUrls: [
      './blog-page.component.scss',
    ],
    encapsulation: ViewEncapsulation.None
  })
export class BlogPageComponent implements OnInit {
    blog: Blog;
    slug: string;
    safeHTML: SafeHtml;
    facebookCommentsUrl: string;

    constructor(
      private blogService: BlogService,
      private route: ActivatedRoute,
      private sanitizer: DomSanitizer,
      private metaService: Meta
    ){}

    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.slug = params['slug'] || '';
        this.blogService.getBlog(this.slug).subscribe(blogResponse => {
          this.blog = blogResponse;
          this.safeHTML = this.sanitizer.bypassSecurityTrustHtml(this.blog.content);
          this.facebookCommentsUrl = `${environment.facebookBaseUrl}?slug=${this.blog.slug}`;
          this.addMetaTags(this.blog);
        });
        // this.blog = this.blogService.getBlog(this.slug) as Blog;
        // console.log({content: this.blog.content});
        // this.safeHTML = this.sanitizer.bypassSecurityTrustHtml(this.blog.content);
      });
    }

    addMetaTags(blog: Blog) {
      this.metaService.addTags( 
        [
          { 
            name: 'title',
            content: blog.title
          },
          { 
            name: 'description',
            content: blog.excerpt
          },
          {
            name: 'keywords',
            content: blog.keywords
          }
        ]
      );
    }
}
