import { DatePipe } from '@angular/common';
import { ViewChild, Component, OnInit, ElementRef, AfterViewInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Driver } from 'app/core/models/driver.schema';
import { DriverService } from 'app/core/services/app/driver.service';
import Selectable from 'selectable.js';
import { endOfWeek, startOfWeek, getDaysInMonth, startOfMonth, endOfMonth, addDays, subMonths, addMonths } from 'date-fns';
import { FORMAT_dd_MM_yyyy, FORMAT_yyyy_MM_dd } from 'app/core/constants';
import { Absence } from 'app/core/models/absence.schema';
import { PrimaryGeneratedColumn } from 'typeorm';
enum AbsenceType {
  ALL_DAY,
  SEMI
}
@Component({
  selector: 'app-absence',
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.scss']
})
export class AbsenceComponent implements OnInit {
  @ViewChild('container') container: ElementRef;

  @ViewChild('modalInfoContent', { static: true }) modalInfoContent: TemplateRef<any>;
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  displayedColumns = ['Conducteur', 'Date de début', 'Date de fin', 'Motif', 'Action'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  employeeList: Driver[] = []
  dayOfMonth: string[] = []
  selectableClass = "absence-cell"
  unselectableClass = "no-absence"
  cellIds = Array()


  // Dates
  currentWeekStartDate = null
  currentWeekEndDate = null
  currentDate = null
  currentMonthStartDate = null
  currentMonthEndDate = null


  // Modal
  modalReference: any;
  modalData: {
    action: string;
    date: string;
  };

  constructor(private modal: NgbModal, private driverService: DriverService, private datePipe: DatePipe) { }

  ngAfterViewInit() {
  }

  ngOnInit(): void {

    this.getDriverList()

    this.currentDate = new Date()
    console.log("Current date : ", JSON.stringify(this.currentDate))
    this.currentMonthStartDate = startOfMonth(new Date());
    //this.currentMonthStartDate = this.datePipe.transform(startOfMonth(new Date()), FORMAT_dd_MM_yyyy);
    this.currentMonthEndDate = endOfMonth(new Date());
    //this.currentMonthEndDate = this.datePipe.transform(endOfMonth(new Date()), FORMAT_dd_MM_yyyy);
    console.log("Current month start date : ", (this.currentMonthStartDate))
    console.log("Current month end date : ", (this.currentMonthEndDate))

    this.updateDaysInMonth()

  }
  getDriverList() {
    this.driverService.getDrivers().subscribe((items) => {
      this.employeeList = items,
        console.log(items);
        items.forEach(driver => {
            this.updateAbsenceCells(driver.id.toString(), driver.absences)
            console.log("DRIVER : "+ JSON.stringify(driver))
          })
    });
  }

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

  updateAbsenceCells(driverId: String, absences: Absence[]) {
    if(absences.length > 0){
       absences.forEach( absence => {
         if(absence.startDate == absence.endDate){
          this.cellIds.push(driverId + "|"+ absence.startDate);
         } else {
          this.getDatesBetween(absence.startDate, absence.endDate).forEach( date => {
            this.cellIds.push(driverId + "|"+ date);
          })
          console.log("Dates between " + absence.startDate + " et " + absence.endDate + " : " + this.getDatesBetween(absence.startDate, absence.endDate))
         }
        
       }
      )
    }
    console.log("Cell ids concerned :" + this.cellIds)
  }

  getPreviousMonth() {
    console.log("New previous current date before ", this.datePipe.transform(this.currentDate, FORMAT_yyyy_MM_dd))

    this.currentDate = subMonths(this.currentDate, 1)
    console.log("New previous current date ", this.datePipe.transform(this.currentDate, FORMAT_dd_MM_yyyy))

    this.updateDaysInMonth()
  }

  getNextMonth() {
    console.log("Current date before add month ", this.datePipe.transform(this.currentDate, FORMAT_yyyy_MM_dd))

    this.currentDate = addMonths(this.currentDate, 1)
    console.log("Current date after add month  ", this.datePipe.transform(this.currentDate, FORMAT_dd_MM_yyyy))
    this.updateDaysInMonth()
  }

  updateDaysInMonth() {
    let currentMonthStartDate = this.datePipe.transform(startOfMonth(this.currentDate), FORMAT_yyyy_MM_dd);
    let currentMonthEndDate = this.datePipe.transform(endOfMonth(this.currentDate), FORMAT_yyyy_MM_dd);

    var i = 0
    this.dayOfMonth = []
    while (i < getDaysInMonth(this.currentDate)) {

      //console.log("Current start month date ADD DAYS ", i, " : ", new Date(currentMonthStartDate))
      //console.log("ADD DAYS ", i, " : ", (addDays(new Date(currentMonthStartDate), i)))

      this.dayOfMonth.push(
        this.datePipe.transform(addDays(new Date(currentMonthStartDate), i), FORMAT_yyyy_MM_dd))
      i++
    }
  }


  getDateFromId(selectedId: any) {
    return selectedId.split("|")[1]
  }

  getDriverFromCellId(selectedId: any) {
    return selectedId.split("|")[0]
  }

  getCellIdFromDriverAndDate(driverId: String, date: String) {
    return driverId + "-" + date
  }

  /**
    * Method called when the user click with the right button
    * @param event MouseEvent, it contains the coordinates
    * @param item Our data contained in the row of the table
    */
  onRightClick(event: MouseEvent) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();

  }

  getCurrentWeekPeriod(date: Date) {
    this.currentWeekStartDate = this.datePipe.transform(startOfWeek(date, { weekStartsOn: 1 }), FORMAT_dd_MM_yyyy);
    //console.log("Start week date : ", this.currentWeekStartDate)
    this.currentWeekEndDate = this.datePipe.transform(endOfWeek(date, { weekStartsOn: 1 }), FORMAT_dd_MM_yyyy);
    //console.log("End week date : ", this.currentWeekEndDate)
  }
}


