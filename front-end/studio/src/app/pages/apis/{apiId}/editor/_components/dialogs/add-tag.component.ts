/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, ElementRef, EventEmitter, Output, QueryList, ViewChildren} from "@angular/core";
import {ModalDirective} from "ngx-bootstrap";


@Component({
    moduleId: module.id,
    selector: "add-tag-dialog",
    templateUrl: "add-tag.component.html",
    styleUrls: ["add-tag.component.css"]
})
export class AddTagDialogComponent {

    @Output() onAdd: EventEmitter<any> = new EventEmitter<any>();

    @ViewChildren("addTagModal") addTagModal: QueryList<ModalDirective>;
    @ViewChildren("addTagInput") addTagInput: QueryList<ElementRef>;

    protected _isOpen: boolean = false;

    protected tag: string = "";
    protected description: string = "";

    /**
     * Called to open the dialog.
     */
    public open(tag?: string): void {
        this.tag = tag;
        if (!tag) {
            this.tag = "";
        }
        this._isOpen = true;
        this.addTagModal.changes.subscribe( thing => {
            if (this.addTagModal.first) {
                this.addTagModal.first.show();
            }
        });
    }

    /**
     * Called to close the dialog.
     */
    public close(): void {
        this._isOpen = false;
        this.tag = "";
        this.description = "";
    }

    /**
     * Called when the user clicks "add".
     */
    protected add(): void {
        let tagInfo: any = {
            name: this.tag,
            description: this.description
        };
        this.onAdd.emit(tagInfo);
        this.cancel();
    }

    /**
     * Called when the user clicks "cancel".
     */
    protected cancel(): void {
        this.addTagModal.first.hide();
    }

    /**
     * Returns true if the dialog is open.
     * @return boolean
     */
    public isOpen(): boolean {
        return this._isOpen;
    }

    /**
     * Called to initialize the selection/focus to the addTagInput field.
     */
    public doSelect(): void {
        this.addTagInput.first.nativeElement.focus();
    }

}
