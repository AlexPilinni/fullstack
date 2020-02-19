import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PositionService} from "../../../shared/services/position.service";
import {Position} from "../../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../../shared/classes/material.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('categoryId') categoryId: string;
  @ViewChild('modal') modalRef: ElementRef;
  positions: Position[] = [];
  loading = false;
  modal: MaterialInstance;
  form: FormGroup;
  positionId = null;

  constructor(
    private positionService: PositionService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(null, [Validators.required, Validators.min(1)])
    });
    this.loading = true;
    console.log(this.categoryId);
    this.positionService.fetch(this.categoryId).subscribe(positions => {
      console.log(positions);
      this.positions = positions;
      this.loading = false;
    })
  }

  ngOnDestroy() {
    this.modal.destroy();
  }

  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  onAddPosition() {
    this.positionId = null;
    this.form.reset({
      name: null,
      cost: 1
    });
    this.modal.open();
    MaterialService.updaeTextInputs();
  }

  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation();
    const decision = window.confirm(`Удалить позицию "${position.name}"?`);

    if(decision) {
      this.positionService.delete(position).subscribe(
        response => {
          const idx = this.positions.findIndex(p => p._id === position._id);
          this.positions.splice(idx,1);
          MaterialService.toast(response.message);
        },
        error => {
          MaterialService.toast(error.error.message)
        }
      )
    }
  }
  onCancel() {
    this.modal.close();
  }
  onSelectPosition(position: Position){
    this.positionId = position._id;
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    });
    this.modal.open();
    MaterialService.updaeTextInputs();
  }

  onSubmit() {
    this.form.disable();
    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    };


    const completed = () => {
      this.modal.close();
      this.form.enable();
      this.form.reset({name: '', cost: 1});
    };

    if(this.positionId) {
      newPosition._id = this.positionId;
      this.positionService.update(newPosition).subscribe(
        position => {
          const idx = this.positions.findIndex((p => p._id === position._id));
          this.positions[idx] = position;
          MaterialService.toast('Изменения сохранены');
        },
        error => {
          this.form.enable();
          MaterialService.toast(error.error.message);
        },
        () => {
          this.modal.close();
          this.form.enable();
          this.form.reset({name: '', cost: 1});
        }
      )
    }
    else {
      this.positionService.create(newPosition).subscribe(
        position => {
          MaterialService.toast('Позиция создана');
          this.positions.push(position);
        },
        error => {
          this.form.enable();
          MaterialService.toast(error.error.message);
        },
        () => {
          this.modal.close();
          this.form.enable();
          this.form.reset({name: '', cost: 1});
        }
      )
    }
  }
}
