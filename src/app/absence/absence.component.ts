import { DatePipe } from '@angular/common';
import { ViewChild, Component, OnInit, ElementRef, AfterViewInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Driver } from 'app/core/models/driver.schema';
import { DriverService } from 'app/core/services/app/driver.service';
import Selectable from 'selectable.js';
import { endOfWeek, startOfWeek, getDaysInMonth, startOfMonth, endOfMonth, addDays, subMonths, addMonths } from 'date-fns';
import { FORMAT_dd_MM_yyyy, FORMAT_yyyy_MM_dd } from 'app/core/constants';
export class Selection {
  driverId: String
  absences: AbsenceSelection[]

  constructor(driverId, absences = []) {
    this.driverId = driverId;
    this.absences = absences;
  }
}
export class AbsenceSelection {
  date: String
  type: AbsenceType;
  isSelected : boolean;

  constructor(date, type: AbsenceType = AbsenceType.ALL_DAY, isSelected = false) {
    this.date = date;
    this.type = type;
    this.isSelected = isSelected;
  }
}

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

  employeeList: Driver[] = []
  dayOfMonth: string[] = []
  selections: Selection[] = []
  absenceForm: FormGroup

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
    const selectable = new Selectable({
      filter: ".selectable",
      toggle: true,  // Enable multiple selection
    });

    selectable.on("end", (e, selected, unselected) => {
      // If selected -> Add to db else remove
      let selectedIds = selected.map(it => it.node.attributes["id"].value)
      console.log("Selected list : ", selected.map(it => it.node.attributes["id"].value))
      selectedIds.forEach(element => {
        this.addToSelect(element, true)
      });
      //if(selectedIds.length > 0) this.addToSelect(selectedIds[0])
      console.log("Deselected list : ", unselected.map(it => it.node.attributes["id"].value))
      let unselectedIds = unselected.map(it => it.node.attributes["id"].value)
      unselectedIds.forEach(element => {
        this.addToSelect(element, false)
      });

    });

    // enable table plugin
    //selectable.table();

    console.log("Selectable items : ", selectable.getItems())
  }

  ngOnInit(): void {

    this.currentDate = new Date()
    console.log("Current date : ", JSON.stringify(this.currentDate))
    this.currentMonthStartDate = startOfMonth(new Date());
    //this.currentMonthStartDate = this.datePipe.transform(startOfMonth(new Date()), FORMAT_dd_MM_yyyy);
    this.currentMonthEndDate = endOfMonth(new Date());
    //this.currentMonthEndDate = this.datePipe.transform(endOfMonth(new Date()), FORMAT_dd_MM_yyyy);
    console.log("Current month start date : ", (this.currentMonthStartDate))
    console.log("Current month end date : ", (this.currentMonthEndDate))

    this.updateDaysInMonth()

    this.initForms()

    this.getDriverList()

  }
  getDriverList() {
    this.driverService.getDrivers().subscribe((items) => {
      this.employeeList = items,
        console.log(items);
    });
  }

  getPreviousMonth(){
    console.log("New previous current date before ", this.datePipe.transform(this.currentDate, FORMAT_yyyy_MM_dd))

    this.currentDate = subMonths(this.currentDate, 1)
    console.log("New previous current date ", this.datePipe.transform(this.currentDate, FORMAT_dd_MM_yyyy))

    this.updateDaysInMonth()
  }

  getNextMonth(){
    console.log("Current date before add month ", this.datePipe.transform(this.currentDate, FORMAT_yyyy_MM_dd))

    this.currentDate = addMonths(this.currentDate, 1)
    console.log("Current date after add month  ", this.datePipe.transform(this.currentDate, FORMAT_dd_MM_yyyy))
    this.updateDaysInMonth()
  }

  updateDaysInMonth() {
    this.currentMonthStartDate = this.datePipe.transform(startOfMonth(this.currentDate), FORMAT_yyyy_MM_dd);
    this.currentMonthEndDate = this.datePipe.transform(endOfMonth(this.currentDate), FORMAT_yyyy_MM_dd);

    var i = 0
    this.dayOfMonth = []
    while (i < getDaysInMonth(this.currentDate)) {

      console.log("Current start month date ADD DAYS ", i, " : ", new Date(this.currentMonthStartDate))
      console.log("ADD DAYS ", i, " : ", (addDays(new Date(this.currentMonthStartDate), i)))

      this.dayOfMonth.push(
        this.datePipe.transform(addDays(new Date(this.currentMonthStartDate), i), FORMAT_yyyy_MM_dd))
      i++
    }
  }

  addToSelect(selectedId, isSelected) {

    var driverId = this.getDriverFromCellId(selectedId)
    console.log("Driver id from ", selectedId, " --> ", driverId)

    var date = this.getDateFromId(selectedId)
    console.log("Date from ", selectedId, " --> ", date)

    var foundItem = this.selections.find(i => i.driverId == driverId)
    console.log("Found item in selection list : ", JSON.stringify(foundItem))
    if(foundItem === undefined){
      // Not exist yet in selection list
      this.selections.push(
        new Selection(
          driverId,
          [
            new AbsenceSelection(
              date,
              AbsenceType.ALL_DAY,
              isSelected
            )
          ]
        )
      )
    } else {
      // Already exist : check if date 

      // Date not already exists
      if(foundItem.absences.find(i => i.date == date) === undefined){
        foundItem.absences.push(
          new AbsenceSelection(
            date,
            AbsenceType.ALL_DAY,
            isSelected
          )
        )
      } else {
        foundItem.absences.find(i => i.date == date).isSelected = isSelected
      }
    }
    console.log("Selections : ", JSON.stringify(this.selections))

    console.log("NEW Selection found : ", JSON.stringify(this.selections.find(i => i.driverId == driverId)))
    console.log("NEW Selection found : ", JSON.stringify(this.selections))

  }

  addDateIfNotExist(foundItem, dateToAdd) {
    if (foundItem.absences.find(it => it.date == dateToAdd) === undefined) {
      foundItem.absences.push(new AbsenceSelection(
        dateToAdd
      ))
    }
    //TODO Maybe juste change type of absence
  }

  getDateFromId(selectedId: any) {
    return selectedId.split("|")[1]
  }

  getDriverFromCellId(selectedId: any) {
    return selectedId.split("|")[0]
  }

  /**
    * Method called when the user click with the right button
    * @param event MouseEvent, it contains the coordinates
    * @param item Our data contained in the row of the table
    */
  onRightClick(event: MouseEvent) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();

    this.displayAdbsenceModal("Test", "date")

  }

  getCurrentWeekPeriod(date : Date){
    this.currentWeekStartDate = this.datePipe.transform(startOfWeek(date, {weekStartsOn: 1}), FORMAT_dd_MM_yyyy);
    //console.log("Start week date : ", this.currentWeekStartDate)
    this.currentWeekEndDate = this.datePipe.transform(endOfWeek(date, {weekStartsOn: 1}), FORMAT_dd_MM_yyyy);
    //console.log("End week date : ", this.currentWeekEndDate)
  }

  //Forms
  initForms() {
    this.absenceForm = new FormGroup({
      id: new FormControl(),
      reason: new FormControl(null),

    })

  }

  displayAdbsenceModal(action, date){
    this.modalData = { action, date };
    this.modalReference = this.modal.open(this.modalContent, { size: 'lg' });  }


}


