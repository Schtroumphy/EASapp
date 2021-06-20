import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FORMAT_yyyy_MM_dd } from 'app/core/constants';
import { Driver } from 'app/core/models/driver.schema';
import { Evenement } from 'app/core/models/evenement.schema';
import { DriverService } from 'app/core/services/app/driver.service';
import { EventService } from 'app/core/services/app/event.service';
import { endOfWeek, startOfWeek } from 'date-fns';

class EventGroupByDate{
  date : Date
  events : Evenement[]

  constructor(date: Date, events : Evenement[]){
    this.date = date;
    this.events = events;
  }
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  currentWeekStartDate = null
  currentWeekEndDate = null
  displayDriverError = false
  driverList: Driver[];

  driverSelectedId = null
  driverSelected = null
  eventsOfTheWeek = []

  // Example : [ {date:'2021-06-15', events : [...]}, {...}]
  eventsGroupByDate : EventGroupByDate[] = []

  constructor(private modal: NgbModal, private eventService: EventService, private driverService: DriverService, private datePipe: DatePipe, private route: ActivatedRoute) {
    // Synchrone
    console.log("Driver parameter retrieved : " + this.route.snapshot.params['p1']);

    // Filter the calendar if a driver is given in route parameter
    if (this.route.snapshot.params['p1'] !== null && this.route.snapshot.params['p1'] !== undefined) {
      this.driverSelectedId = this.route.snapshot.params['p1']
    } else {
      this.driverSelectedId = null
    }
  }

  ngOnInit(): void {
    this.getCurrentWeekPeriod(new Date())

    if(this.driverSelectedId !== null && this.driverSelectedId !== undefined){
      this.displayDriverError = false

      this.getEventsByDriverSelectedId()

      this.initEventsGroupByDateArray()
    } else {
      this.displayDriverError = true
      this.eventsGroupByDate = []
      this.eventsOfTheWeek = []
      this.driverSelected = null
    }

    this.populateDriverList()
  }

  populateDriverList() {
    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items,
        console.log(items);
    });
  }
  

  initEventsGroupByDateArray() {
    console.log("Build array event group by date between ", this.currentWeekStartDate, " and ", this.currentWeekEndDate)
    //console.log("Current start date number ", new Date(this.currentWeekStartDate).getDay())
    this.eventsGroupByDate = []
    var i = 0
    while(i< 7){
      var date = new Date(this.currentWeekStartDate)
      var newDate = date.setDate( date.getDate() + i)
      //console.log("New date ", this.datePipe.transform(newDate, FORMAT_yyyy_MM_dd).toString())

      //console.log("Filter by date : ", this.datePipe.transform(newDate, FORMAT_yyyy_MM_dd))
      //console.log("Filter events by date : ", this.eventsOfTheWeek.filter(it => it.date == this.datePipe.transform(newDate, FORMAT_yyyy_MM_dd)))
      if(this.eventsOfTheWeek.length > 0) {
        this.eventsGroupByDate.push(
          new EventGroupByDate(
            date,
            this.sortByDueDate(this.eventsOfTheWeek.filter(it => it.date == this.datePipe.transform(newDate, FORMAT_yyyy_MM_dd)))
          )
        )
      }
      i++
    }
    console.log("EVENTS GROUPED : ", JSON.stringify(this.eventsGroupByDate))
  }

  public sortByDueDate(array : Evenement[]): Evenement[] {
    array.sort((a: Evenement, b: Evenement) => {
      var first = new Date(a.date + " " + a.startHour)
      var second = new Date(b.date + " " + b.startHour)
        return +first- +second;
    });
    console.log("ARRAY FLTERED : ", JSON.stringify(array.map(it => it.startHour)))
    return array
}

  getEventsByDriverSelectedId(){
    if (this.driverSelectedId != null) {
      this.eventsOfTheWeek = []
      this.eventService.getEventsByDriverId(parseInt(this.driverSelectedId)).subscribe((items) => {
        this.eventsOfTheWeek = this.eventsOfTheWeek.concat(items);
      }
      )
    }
    this.getEventsBetweenTwoDates()
  }

  getCurrentWeekPeriod(date : Date){
    this.currentWeekStartDate = this.datePipe.transform(startOfWeek(date, {weekStartsOn: 1}), FORMAT_yyyy_MM_dd);
    //console.log("Start week date : ", this.currentWeekStartDate)
    this.currentWeekEndDate = this.datePipe.transform(endOfWeek(date, {weekStartsOn: 1}), FORMAT_yyyy_MM_dd);
    //console.log("End week date : ", this.currentWeekEndDate)
  }

  getEventsBetweenTwoDates() {
    this.eventService.getEventsBetweenTwoDates(this.currentWeekStartDate, this.currentWeekEndDate).subscribe(
      (events) => {
        this.eventsOfTheWeek = this.sortByDate(events, 'date')
        //console.log("EVENTS OF WEEK sort by driver : ", JSON.stringify(this.eventsOfTheWeek))
        
        if (this.driverSelectedId != null) {
          //console.log("SORT BY DRIVER : ", this.driverSelectedId)
          this.driverService.getDriverById(parseInt(this.driverSelectedId)).subscribe(
            (item) => {
              //console.log("Selected driver ", JSON.stringify(item))
              this.eventsOfTheWeek = this.eventsOfTheWeek.filter(event => event.driver.id === item.id);
              this.driverSelected = item
            });
          //console.log("EVENT TO DUPLIACTE : ", JSON.stringify(this.eventsOfTheWeek))
        }
      },
      (error) => this.errorAlert()
    );
  }

  errorAlert(): void {
    console.log("ERROR : Cannot retrieve event of driver")
  }

  sortByDate(events: Evenement[], prop: string): Evenement[] {
    return events.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }


  getNextWeek(){
    let oldStartDate = new Date(this.currentWeekStartDate)
    let currentDatePlus7days = oldStartDate.setDate(oldStartDate.getDate() + 7)
    
    this.updateCurrentStartEndDate(currentDatePlus7days)
  }

  getPreviousWeek(){
    let oldStartDate = new Date(this.currentWeekStartDate)
    let currentDateMinus7days = oldStartDate.setDate(oldStartDate.getDate() - 7)

    this.updateCurrentStartEndDate(currentDateMinus7days)
  }

  updateCurrentStartEndDate(date){
    console.log("OLD START DATE - 7 : ", this.datePipe.transform(date, FORMAT_yyyy_MM_dd))
    this.currentWeekStartDate = this.datePipe.transform(startOfWeek(date, {weekStartsOn: 1}), FORMAT_yyyy_MM_dd);
    this.currentWeekEndDate = this.datePipe.transform(endOfWeek(date, {weekStartsOn: 1}), FORMAT_yyyy_MM_dd);
    console.log("NEW START DATE : ", this.currentWeekStartDate)
    console.log("NEW END DATE : ", this.currentWeekEndDate)

    this.updateDatas()
  }

  updateDatas(){
    if(this.driverSelectedId !== null && this.driverSelectedId !== undefined) {
      this.displayDriverError  = false
      this.getEventsByDriverSelectedId()

      this.initEventsGroupByDateArray()
    } else {
      this.displayDriverError  = true
    }
  }


}
