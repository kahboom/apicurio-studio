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

import {Component, EventEmitter, Output, QueryList, ViewChildren} from "@angular/core";
import {ModalDirective} from "ngx-bootstrap";
import {CodeEditorMode, CodeEditorTheme} from "../../../../../../components/common/code-editor.component";
import {ObjectUtils} from "../../../../../../util/common";
import * as YAML from "yamljs";
import {Oas30Example} from "oai-ts-core";


export interface EditExampleEvent {
    example: Oas30Example;
    value: any;
}

@Component({
    moduleId: module.id,
    selector: "edit-example-dialog",
    templateUrl: "edit-example.component.html"
})
export class EditExampleDialogComponent {

    @Output() onEdit: EventEmitter<EditExampleEvent> = new EventEmitter<EditExampleEvent>();

    @ViewChildren("editExampleModal") editExampleModal: QueryList<ModalDirective>;

    private example: Oas30Example;
    protected _isOpen: boolean = false;

    protected model: any = {
        value: null,
        format: CodeEditorMode.JSON,
        valid: true
    };

    get value() {
        return this.model.value;
    }
    set value(value: string) {
        this.setValueFormatFromValue(value);
        this.model.value = value;
    }

    /**
     * Called to open the dialog.
     * @param Oas30Example example
     */
    public open(example: Oas30Example): void {
        this._isOpen = true;
        this.example = example;
        this.model = {
            value: null,
            format: CodeEditorMode.JSON,
            valid: true
        };

        let val: any = example.value;
        if (typeof val === "object") {
            val = JSON.stringify(val, null, 4);
        }

        this.model.value = val;
        this.setValueFormatFromValue(val);

        this.editExampleModal.changes.subscribe( () => {
            if (this.editExampleModal.first) {
                this.editExampleModal.first.show();
            }
        });
    }

    /**
     * Called to close the dialog.
     */
    public close(): void {
        this._isOpen = false;
    }

    /**
     * Called when the user clicks "edit".
     */
    protected edit(): void {
        let event: EditExampleEvent = {
            example: this.example,
            value: this.model.value
        };
        if (this.model.valid && this.model.format === CodeEditorMode.JSON) {
            try {
                event.value = JSON.parse(this.model.value);
            } catch (e) {
                console.error("[EditExampleDialogComponent] Failed to parse example.");
            }
        }
        this.onEdit.emit(event);
        this.cancel();
    }

    /**
     * Called when the user clicks "cancel".
     */
    protected cancel(): void {
        this.editExampleModal.first.hide();
    }

    /**
     * Returns true if the dialog is open.
     * @return boolean
     */
    public isOpen(): boolean {
        return this._isOpen;
    }

    public valueEditorTheme(): CodeEditorTheme {
        return CodeEditorTheme.Light;
    }

    public valueEditorMode(): CodeEditorMode {
        return this.model.format;
    }

    public hasValue(): boolean {
        return !ObjectUtils.isNullOrUndefined(this.model.value);
    }

    /**
     * @param string value
     */
    private setValueFormatFromValue(value: string): void {
        if (value && value.trim().startsWith("{")) {
            this.model.format = CodeEditorMode.JSON;
            try {
                JSON.parse(value);
                this.model.valid = true;
            } catch (e) {}
        } else if (value && value.trim().startsWith("<")) {
            this.model.format = CodeEditorMode.XML;
        } else {
            this.model.format = CodeEditorMode.YAML;
            try {
                YAML.parse(value);
                this.model.valid = true;
            } catch (e) {}
        }
    }

}
