import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, AccordionComponent, AccordionItemComponent, TemplateIdDirective, AccordionButtonDirective, BgColorDirective } from '@coreui/angular';
import { DocsExampleComponent } from '@docs-components/public-api';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { AppConfig } from 'src/app/app-config';
import { tap, catchError } from 'rxjs/operators'; 

@Component({
    selector: 'app-accordions',
    templateUrl: './accordions.component.html',
    styleUrls: ['./accordions.component.scss'],
    standalone: true,
    imports: [RowComponent, HttpClientModule, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, AccordionComponent, AccordionItemComponent, TemplateIdDirective, AccordionButtonDirective, BgColorDirective]
})
export class AccordionsComponent implements OnInit {

  items = [1, 2, 3, 4];
  task: any = [];
  private APIURL = `${AppConfig.server}/`; 

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { }

  getAccordionBodyText(value: string | number) {
    const textSample = `
      <strong>This is the <mark>#${value}</mark> item accordion body.</strong> It is hidden by
      default, until the collapse plugin adds the appropriate classes that we use to
      style each element. These classes control the overall appearance, as well as
      the showing and hiding via CSS transitions. You can modify any of this with
      custom CSS or overriding our default variables. It&#39;s also worth noting
      that just about any HTML can go within the <code>.accordion-body</code>,
      though the transition does limit overflow.
    `;
    return this.sanitizer.bypassSecurityTrustHtml(textSample);
  }

  update_chart_api(): Observable<any> {
    return this.http.get(this.APIURL + "read_data").pipe(
      tap((res: any) => {
        this.task = res.data || [];
        console.log('API Response:', res);
      }))
  }

  ngOnInit(): void {
    console.log(this.items)
    this.update_chart_api().subscribe({
      
    }
    );
  }
  
}
