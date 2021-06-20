import { ViewChild, Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import Selectable from 'selectable.js';

export class Selection {
  driverId: String
  absences: AbsencePair[]

  constructor(driverId, absences = []) {
    this.driverId = driverId;
    this.absences = absences;
  }
}

export class AbsencePair{
  date : String
  type : AbsenceType;

  constructor(date, type: AbsenceType = AbsenceType.ALL_DAY) {
    this.date = date;
    this.type = type;
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

  dayOfMonth: number[] = []
  employeeList = ["Chauffeur 1", "Gérard", "Dupont", "Marc", "Tania", "Elise"]

  selectedIds : Selection[]= []

  constructor() { }

  ngAfterViewInit() {
    const selectable = new Selectable({
      filter: ".selectable",
      toggle: true
    });
    
    // enable table plugin
    selectable.table();
  }

  ngOnInit(): void {
    this.initSelectionList()

    this.initSelectable()


    this.initDayOfMonth()
  }
  initSelectable() {

  }


  // TODO : Retrieve from database between two current dates all the absence of all drivers
  // After, map the information into a Selection list and display it
  initSelectionList() {
    this.employeeList.forEach(employee => {
      var newSelection = new Selection(
        employee
      )
      this.selectedIds.push(newSelection)
    })
  }

 

  initDayOfMonth() {
    var i = 1
    while (i < 31) {
      this.dayOfMonth.push(i)
      i++
    }
  }

addToSelectedIdArray(selectedId) {

  var driverId = this.getDriverFromCellId(selectedId)
  console.log("Driver id from ", selectedId, " --> ", driverId)

  var date = this.getDateFromId(selectedId)
  console.log("Date from ", selectedId, " --> ", date)

  console.log("Selection found : ", JSON.stringify(this.selectedIds.find(i => i.driverId == driverId)))
  var foundItem = this.selectedIds.find(i => i.driverId == driverId)
  this.addDateIfNotExist(foundItem, date)
  console.log("NEW Selection found : ", JSON.stringify(this.selectedIds.find(i => i.driverId == driverId)))
  console.log("NEW Selection found : ", JSON.stringify(this.selectedIds))

}

addDateIfNotExist(foundItem, dateToAdd){
  if(foundItem.absences.find(it => it.date == dateToAdd) === undefined){
    foundItem.absences.push( new AbsencePair(
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

}


