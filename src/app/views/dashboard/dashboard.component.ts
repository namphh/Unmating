import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js'; // Import Chart class and other necessary types
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { WidgetsBrandComponent } from '../widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppConfig } from 'src/app/app-config';
import { Observable, forkJoin, tap } from 'rxjs';

interface IChartWithMaxValue extends IChartProps {
  maxValue: number; // Add maxValue as a property
  time: string; // Add time as a property
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    WidgetsDropdownComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    ReactiveFormsModule,
    ButtonGroupComponent,
    ChartjsComponent,
    CardFooterComponent,
    ProgressBarDirective,
    ProgressComponent,
    WidgetsBrandComponent,
    CardHeaderComponent,
    TableDirective,
    AvatarComponent
  ]
})
export class DashboardComponent implements OnInit {
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);

  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Month')
  });

  public displayedCharts: Array<IChartWithMaxValue> = [];
  private autoAppendCharts: boolean = false; // Boolean variable for automatic chart addition
  private savePath: string | null = null; // To store the selected directory path
  private APIURL = `${AppConfig.server}/`; 
  task: any = [];
  task_check: any = [];
  task_write: any = [];
  private count: number = 0; // Variable to keep track of chart additions
  private maxCharts: number = 200; // Maximum number of charts

  constructor(
    private http: HttpClient
  ) { }


  update_chart_api(): Observable<any> {
    return this.http.get(this.APIURL + "read_data").pipe(
      tap((res: any) => {
        this.task = res.data || [];
        console.log('API Response:', res);
      }));
  }

  check_api(): Observable<any> {
    return this.http.get(this.APIURL + "check_data").pipe(
      tap((res: any) => {
        this.task_check = res.data || [];
        console.log('API Response:', res);
      }));
  }

  write_api(): Observable<any> {
    return this.http.get(this.APIURL + "write_data").pipe(
      tap((res: any) => {
        this.task_write = res.data || [];
        console.log('API Response:', res);
      }));
  }

  ngOnInit(): void {
    this.initCharts();
    Chart.register(zoomPlugin); // Register zoom plugin
    this.toggleAutoAppendCharts(true);
    // Set interval to check the boolean variable every 1 second
    setInterval(() => {
      this.check_api().subscribe(response => {
        if (response.data[0] === 1) {  
          this.checkAndAppendChart();
          this.write_api().subscribe(() => {}); 
        }
      });
    }, 1000); // 1-second interval
  }

  initCharts(): void {
    // Initial chart setup logic if needed
  }

  resetZoom(): void {
    this.mainChartRef.set(undefined);
    this.initCharts();
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.#chartsData.initMainChart(value);
    this.initCharts();
  }

  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.mainChartRef.set($chartRef);
    }
  }

  addChart(): void {
    if (this.count >= this.maxCharts) {
      console.log('Maximum number of charts reached.');
      return;
    }
  
    const singleDataSet = [1,];
    
    // Fetch data from the API
    singleDataSet.pop();
    this.update_chart_api().subscribe(response => {
      if (Array.isArray(response)) {
        response.forEach((task: any) => {
          singleDataSet.push(task);
        });
      } else if (response && Array.isArray(response.data)) {
        response.data.forEach((task: any) => {
          singleDataSet.push(task);
        });
      } else {
        console.error("API response is not in the expected format.");
      }
    
      const chartData = {
        ...this.#chartsData.initMainChart('Month', singleDataSet),
        options: {
          ...this.#chartsData.initMainChart('Month', singleDataSet).options,
          scales: {
            y: {
              min: 0,
              max: Math.max(...singleDataSet) * 1.1,
            },
          },
        },
      };
    
      if (chartData.data && chartData.data.datasets && chartData.data.datasets.length > 0) {
        const dataset = chartData.data.datasets[0].data as (number | null)[];
        const maxValue = this.getMaxValue(dataset);
        const currentTime = new Date().toLocaleTimeString();
    
        this.displayedCharts.push({
          ...chartData,
          maxValue: maxValue,
          time: currentTime
        });
        
        this.count++; // Increment the count of charts
        console.log(`Chart count: ${this.count}`);
  
        // Scroll to the last chart added
        setTimeout(() => {
          const chartContainer = this.#document.querySelector('.chart-container') as HTMLElement;
          if (chartContainer) {
            this.#renderer.setProperty(chartContainer, 'scrollLeft', chartContainer.scrollWidth);
          }
        }, 0);
      } else {
        console.error("Chart data or datasets are undefined.");
      }
    });
  }
  
  

  getMaxValue(dataSet: (number | null)[]): number {
    const numericValues = dataSet.filter((value): value is number => value !== null);
    return numericValues.length > 0 ? Math.max(...numericValues) : 0;
  }

  toggleAutoAppendCharts(value: boolean): void {
    this.autoAppendCharts = value;
  }

  checkAndAppendChart(): void {
    if (this.autoAppendCharts && this.count < this.maxCharts) {
      this.addChart();
    }
  }

  deleteCharts(): void {
    this.displayedCharts = [];
    this.count = 0; // Reset the chart count when charts are deleted
  }

  selectDirectory(): void {
    const directoryInput = document.getElementById('directoryInput') as HTMLInputElement;
    directoryInput.click(); // Trigger the input click to open the file dialog
  }

  onDirectorySelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      this.savePath = files[0].webkitRelativePath.split('/')[0]; // Get the directory name from the file path
      console.log('Selected directory:', this.savePath);
    }
  }

  exportExcel(): void {
    const excelData = this.displayedCharts.map((chartData, index) => ({
      CYCLE: index + 1,
      'PEAK FORCE': chartData.maxValue,
      TIME: chartData.time // Use the stored time for each chart
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Charts Data');
  
    const fileName = this.savePath ? `${this.savePath}/charts_data.xlsx` : 'charts_data.xlsx';
    XLSX.writeFile(workbook, fileName);
  }

  saveChartAsImage(): void {
    if (this.displayedCharts.length > 0) {
      const lastChartElement = document.querySelector('.chart-item:last-child') as HTMLElement;
  
      if (lastChartElement) {
        html2canvas(lastChartElement).then(canvas => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          const fileName = this.savePath ? `${this.savePath}/chart_image.png` : 'chart_image.png';
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else {
        console.error("Last chart element not found.");
      }
    } else {
      console.error("No charts to save.");
    }
  }
}

