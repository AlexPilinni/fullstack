import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {AnalyticsPage} from "../shared/interfaces";
import {Subscription} from "rxjs";
import {Chart} from 'chart.js'


@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gain') gainRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;

  aSub: Subscription;
  average: number;
  pending = true;

  constructor(private service: AnalyticsService) { }

  ngAfterViewInit() {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)'
    };
    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)'
    };


    this.aSub = this.service.getAnalytics().subscribe( (data: AnalyticsPage) => {
      this.average = data.average;

      gainConfig.labels = data.chart.map(item => item.label);
      gainConfig.data = data.chart.map(item => item.gain);

      orderConfig.labels = data.chart.map(item => item.label);
      orderConfig.data = data.chart.map(item => item.order);

      // ******temp****
      // gain
      gainConfig.labels.push('17.02.2020');
      gainConfig.data.push(120);

      gainConfig.labels.push('18.02.2020');
      gainConfig.data.push(180);

      gainConfig.labels.push('19.02.2020');
      gainConfig.data.push(150);

      gainConfig.labels.push('20.02.2020');
      gainConfig.data.push(100);

      gainConfig.labels.push('21.02.2020');
      gainConfig.data.push(120);

      gainConfig.labels.push('22.02.2020');
      gainConfig.data.push(100);

      gainConfig.labels.push('23.02.2020');
      gainConfig.data.push(150);

      gainConfig.labels.push('24.02.2020');
      gainConfig.data.push(300);
      //order
      orderConfig.labels.push('17.02.2020');
      orderConfig.data.push(2);

      orderConfig.labels.push('18.02.2020');
      orderConfig.data.push(8);

      orderConfig.labels.push('19.02.2020');
      orderConfig.data.push(1);

      orderConfig.labels.push('20.02.2020');
      orderConfig.data.push(3);

      orderConfig.labels.push('21.02.2020');
      orderConfig.data.push(5);

      orderConfig.labels.push('22.02.2020');
      orderConfig.data.push(10);

      orderConfig.labels.push('23.02.2020');
      orderConfig.data.push(12);

      orderConfig.labels.push('24.02.2020');
      orderConfig.data.push(15);

      // ******temp****

      const gainContext = this.gainRef.nativeElement.getContext('2d');
      const orderContext = this.orderRef.nativeElement.getContext('2d');
      gainContext.canvas.height = '300px';
      orderContext.canvas.height = '300px';

      new Chart(gainContext, createChartConfig(gainConfig));

      new Chart(orderContext, createChartConfig(orderConfig));



      this.pending = false;
    });

  }

  ngOnDestroy() {
    if(this.aSub) {
      this.aSub.unsubscribe();
    }
  }


}

function createChartConfig({labels, data, label, color}) {
  return {
    type: 'line',
    options: {
      responsive: true
    },
    data: {
      labels,
      datasets: [
        {
          label, data,
          borderColor: color,
          steppedLine: false,
          fill: false
        }
      ]
    }
  }

}
