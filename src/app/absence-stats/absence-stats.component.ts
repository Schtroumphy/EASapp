import { Component, OnInit } from '@angular/core';
import { Absence } from 'app/core/models/absence.schema';
import { Driver } from 'app/core/models/driver.schema';
import { AbsenceService } from 'app/core/services/app/absence.service';
import { DriverService } from 'app/core/services/app/driver.service';
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

  driverList : Driver[] = []
  absenceList: Absence[] = []

  public barChartData: ChartDataSets[] = [];

  constructor(private driverService: DriverService, private absenceService: AbsenceService) { }

  ngOnInit(): void {

    let currentDate = new Date()
    console.log("Current year : " + currentDate.getUTCFullYear())

    // Display months in bar schart
    this.getAllMonthsInCurrentYear()

    // Build empty chart data sets by driver 
    this.driverService.getDrivers().subscribe((drivers) => (this.driverList = drivers));
    this.buildEmptyChartDataSets()

    // Retrieve all absences of this year
    this.absenceService.getAllAbsencesByYear("2021").subscribe((absences) => {
      this.absenceList = absences
      absences.forEach(absence => {
        //console.log("Absence by year "+ JSON.stringify(absence))
      })
    })

    // Value chart data set with absences retrieved
    this.fillChartDataSet()

  }

  fillChartDataSet() {
    this.absenceList.forEach(absence => {
      console.log("DRIVER : "+ this.getDriverCompleteName(absence.driver))
      var test = this.barChartData.find(element => element.label === this.getDriverCompleteName(absence.driver)) as ChartDataSets
      console.log("TEST "+ JSON.stringify(test.data))

      // Get all dates between dates
      this.getDatesBetween(absence.startDate, absence.endDate).forEach(date => {
        if(date.includes('2021')){
          var oldNumber = test.data[this.getMonthNumber(date)] as number
          console.log("DATE : " + date + " OLD NUMBER : " + oldNumber)

          test.data[this.getMonthNumber(date)] = oldNumber + 1
        }
      })
      console.log("TEST AFTER UPDATE "+ JSON.stringify(test.data))

    })
  }
  getMonthNumber(date: string) {
    return parseInt(date.split("-")[1]) - 1
  }

  buildEmptyChartDataSets() {
    this.driverList.forEach( driver => {
      this.barChartData.push({
        data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: this.getDriverCompleteName(driver)
      })
    })
  }

  // -------------- Get dates between 2 dates --------------

  getDatesBetween(startDate, endDate){
    const listDate = [];
    const dateMove = new Date(startDate);
    let strDate = startDate;

    if(startDate == endDate) listDate.push(strDate);
    while (strDate < endDate) {
      strDate = dateMove.toISOString().slice(0, 10);
      //console.log("STR DATE : ", strDate)
      listDate.push(strDate);
      dateMove.setDate(dateMove.getDate() + 1);
      //console.log("STR DATE + 1 : ", dateMove)
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
   //console.log("Month list : " + this.monthList)

  }

  // Others

  getDriverCompleteName(driver : Driver) : string {
    return driver.lastname.toUpperCase() + " " + driver.firstname[0].toUpperCase() + driver.firstname.slice(1);
}

}
