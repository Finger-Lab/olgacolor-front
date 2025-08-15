import { Component } from '@angular/core';
import { HeaderComponent } from "../../../components/header/header.component";
import { NewsletterComponent } from "../../../components/newsletter/newsletter.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { MarketsService } from '../../../services/markets.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-markets',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './add-markets.component.html',
  styleUrl: './add-markets.component.scss'
})
export class AddMarketsComponent {
  classScrolled: string = 'scrolled position-sticky'

  form: FormGroup

  categories: string[] = [
    'Categoria 1',
    'Categoria 2',
    'Categoria 3'
  ]

  highlights: string[] = [
    'Ponto 1',
    'Ponto 2',
    'Ponto 3',
    'Ponto 4',
    'Ponto 5'
  ]
  
  selectedFilesImages: File[] = []
  selectedFilesTypologies: File[] = []

  constructor(private fb: FormBuilder, private marketsService: MarketsService, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      air_permeability: [''],
      water_tightness: [''],
      wind_resistance: [''],
      acoustic_insulation: [''],
      thermal_transmittance: [''],
      glazing_thickness: [''],
      width: [''],
      height: [''],
      weight: [''],
      theoretical_thickness: [''],
      highlights: this.fb.array(this.highlights.map(() => this.fb.control(false)))
    })
  }

  get highlightsArray(): FormArray {
    return this.form.get('highlights') as FormArray
  }

  getHighlightControl(index: number): FormControl {
    return this.highlightsArray.at(index) as FormControl;
  }

  getSelectedHighlights(): string[] {
    return this.highlights
      .filter((_, index) => this.highlightsArray.value[index])
  }

  createMarket() {
    const formData = new FormData()

    Object.keys(this.form.value).forEach(key => {
      if (key === 'highlights') {
        const selectedHighlights = this.getSelectedHighlights()
        selectedHighlights.forEach(value => {
          formData.append('highlights[]', value)
        })
      } else {
        formData.append(key, this.form.value[key])
      }
    })

    this.selectedFilesImages.forEach(file => {
      formData.append('images[]', file)
    })

    this.selectedFilesTypologies.forEach(file => {
      formData.append('imagesTypologies[]', file)
    })

    if (this.form.invalid) {
      this.snackBar.open('Preencha todos os campos corretamente', 'Fechar', {
        duration: 3000
      })
      return 
    }

    this.marketsService.createMarket(formData).subscribe((res: any) => {
      this.snackBar.open('Produto criado com sucesso', 'Fechar', {
        duration: 3000
      })
      this.form.reset()
    })
  }

  onFilesSelected(event: any) {
    this.selectedFilesImages = Array.from(event.target.files)
  }

  onFilesSelectedTypologies(event: any) {
    this.selectedFilesTypologies = Array.from(event.target.files)
  }
}
