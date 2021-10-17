import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-absence-stats',
  templateUrl: './absence-stats.component.html',
  styleUrls: ['./absence-stats.component.scss']
})
export class AbsenceStatsComponent implements OnInit {

  monthList = []
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [0, 9, 8, 1, 6, 5, 0, 0, 8, 9, 1, 0], label: 'Driver A' },
    { data: [0, 4, 0, 0, 6, 7, 0, 0, 0, 0, 0, 2], label: 'Driver B' },
    { data: [0, 4, 0, 6, 0, 0, 10, 0, 0, 0, 0, 2], label: 'Driver C' },
    { data: [0, 4, 0, 7, 0, 1, 0, 0, 0, 0, 0, 2], label: 'Driver D' },
    { data: [0, 4, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2], label: 'Driver E' },
    { data: [0, 4, 0, 2, 3, 0, 0, 0, 0, 0, 0, 2], label: 'Driver F' },
    { data: [0, 4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], label: 'Driver G' },
  ];


  constructor() { }

  ngOnInit(): void {

    let currentDate = new Date()
    console.log("Current year : " + currentDate.getUTCFullYear())

    this.getAllMonthsInCurrentYear()
  }

  // -------------- Get dates between 2 dates --------------

  getDatesBetween(startDate, endDate){
    const listDate = [];
    const dateMove = new Date(startDate);
    let strDate = startDate;

    while (strDate < endDate) {
      strDate = dateMove.toISOString().slice(0, 10);
      console.log("STR DATE : ", strDate)
      listDate.push(strDate);
      dateMove.setDate(dateMove.getDate() + 1);
      console.log("STR DATE + 1 : ", dateMove)
    };
    console.log("List dates : ", listDate)
    return listDate
  }

  // -------------- All months in current year --------------
  getAllMonthsInCurrentYear(){
    let currentYear = new Date().getFullYear()
    let month 

    for (let i = 1; i < 13; i++) {
      if(i<10) month = "0"
      month += i
      this.barChartLabels.push(month + "/" + currentYear)
      month = ""
    }
    console.log("Month list : " + this.monthList)

  }

}
