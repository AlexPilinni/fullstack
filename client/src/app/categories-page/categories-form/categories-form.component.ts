import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoriesService} from "../../shared/services/categories.service";
import {switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {MaterialService} from "../../shared/classes/material.service";
import {Category} from "../../shared/interfaces";

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})
export class CategoriesFormComponent implements OnInit {
  @ViewChild('input') inputRef: ElementRef;

  form: FormGroup;
  isNew = true;
  image: File;
  imagePreview: string | ArrayBuffer;
  category;

  constructor(
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private router: Router
  ) { }

  ngOnInit() {

    this.form = new FormGroup( {
      name: new FormControl(null, [Validators.required])
    });

    // this.route.params.subscribe((params:Params) => {
    //   if(params['id']) {
    //     // Мы редактируем форму
    //     this.isNew = false;
    //   }
    // })

    this.form.disable();

    this.route.params
      .pipe(

        switchMap(
          (params: Params) => {
              if(params['id']) {
                this.isNew = false;
                return this.categoriesService.getById(params['id'])
              }
              else return of(null)
          }
        )
      )
      .subscribe(
        (category: Category) => {
          if(category) {
            this.category = category;
            this.form.patchValue({
              name: category.name
            });
            this.imagePreview = category.imageSrc;
            MaterialService.updaeTextInputs();
          }

          this.form.enable();
        },
        error => {
          MaterialService.toast(error);
        }
      )
  }

  triggerClick() {
    this.inputRef.nativeElement.click()
  }

  deleteCategory() {
    const decision = window.confirm(`Вы уверены, что хотите удалить категорию "${this.category.name}"`);

    if(decision) {
      this.categoriesService.delete(this.category._id)
        .subscribe(
          response => {MaterialService.toast(response.message)},
          error => {MaterialService.toast(error.message)},
          () => this.router.navigate(['/categories'])
        )
    }
  }

  onFileUpload(event: any){
    const file = event.target.files[0];
    this.image = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file)
  }

  onSubmit() {
    let obs$;
    this.form.disable();
    if(this.isNew) {
      //create
      obs$ = this.categoriesService.create(this.form.value.name, this.image)
    }
    else {
      //update
      obs$ = this.categoriesService.update(this.category._id, this.form.value.name, this.image)
    }
    obs$.subscribe(
      category => {
        this.category = category;
        MaterialService.toast('Изменения сохранены');
        this.form.enable();

      },
      error => {
        MaterialService.toast(error.error.message);
        this.form.enable();
      }
    )
  }
}
