import {Component, HostListener, Inject, OnInit} from '@angular/core';
import * as moment from 'moment/moment';
import {saveAs} from 'file-saver';
import {DOCUMENT} from '@angular/common';
import {MessageService} from 'primeng/api';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

import {imageDataToBlob} from '../funcs';
import {getToastMessage} from '../toast-messages';
import {VncService} from '../vnc.service';

@UntilDestroy()
@Component({
  selector: 'app-vnc-view-buttons',
  templateUrl: './vnc-view-buttons.component.html'
})
export class VncViewButtonsComponent implements OnInit {
  @HostListener('document:fullscreenchange', ['$event'])
  baseFullscreenChange(): void {
    this.ifFullScreen = this.document.fullscreenElement !== null;
  }

  isConnected!: boolean;
  isView!: boolean;
  ifFullScreen: boolean = false;
  private docElement!: any;

  constructor(@Inject(DOCUMENT) private document: any,
              private vncService: VncService,
              private messageService: MessageService) {}

  ngOnInit() {
    this.docElement = document.documentElement;
    this.vncService.isConnected$
      .pipe((untilDestroyed(this)))
      .subscribe((isConnected: boolean) => this.isConnected = isConnected);
    this.vncService.isView$
      .pipe(untilDestroyed(this))
      .subscribe((isView: boolean) => this.isView = isView);
  }

  onTakeScreenshot(): void {
    imageDataToBlob(this.vncService.getImageData())
      .then((data: Blob) => {
        const date: string = moment().format('DD.MM.YYYY_HH_mm_ss');
        saveAs(data, `screenshot_${this.vncService.getComputerName()}_${date}.png`);
      })
      .catch((reason: any) => this.messageService.add(getToastMessage('screenshot_error', reason)));
  }

  onToggleView(): void {
    this.vncService.toggleView();
  }

  onToggleFullScreenView(): void {
    if (!this.ifFullScreen) {
      if (this.docElement.requestFullscreen) {
        this.docElement.requestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      }
    }
  }
}
