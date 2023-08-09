import {Component, Input} from '@angular/core';
// @ts-ignore
import RFB from "@novnc/novnc/core/rfb.js";

@Component({
  selector: 'app-vnc-action-buttons',
  templateUrl: './vnc-action-buttons.component.html',
  styleUrls: ['./vnc-action-buttons.component.scss']
})
export class VncActionButtonsComponent {
  @Input() rfb!: RFB;
  @Input() isConnected!: boolean;

  onDisconnectClient(): void {
    if (this.rfb) {
      this.rfb.disconnect();
    }
  }
}
