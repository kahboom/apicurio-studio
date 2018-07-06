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

import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren
} from "@angular/core";
import {OasDocument, OasNode, OasValidationProblem} from "oai-ts-core";
import {createChangeTitleCommand, ICommand} from "oai-ts-commands";
import {ModelUtils} from "../_util/model.util";
import {ApiEditorUser} from "../../../../../models/editor-user.model";
import {SelectionService} from "../_services/selection.service";
import {CommandService} from "../_services/command.service";


/**
 * The component that models the editor's Title Bar.  The title bar shows the title of the
 * API (and allows the title to be edited).  It also shows the notification icon (the Bell icon)
 * which activates when there are validation problems detected.
 */
@Component({
    moduleId: module.id,
    selector: "title-bar",
    templateUrl: "title-bar.component.html"
})
export class EditorTitleBarComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() document: OasDocument;
    @Input() validationErrors: OasValidationProblem[];

    filterCriteria: string = null;

    public showProblems: boolean = false;
    public editMode: boolean = false;

    public newTitle: string;

    @ViewChildren("newtitle") titleInput: QueryList<ElementRef>;

    constructor(private selectionService: SelectionService, private commandService: CommandService) {
    }

    public ngOnInit(): void {
    }

    public ngOnDestroy(): void {
    }

    public ngAfterViewInit(): void {
        this.titleInput.changes.subscribe(changes => {
            if (changes.last) {
                setTimeout(() => {
                    changes.last.nativeElement.focus();
                    changes.last.nativeElement.select();
                }, 10);
            }
        });
    }

    public onInputKeypress(event: KeyboardEvent): void {
        if (event.key === "Escape") {
            this.cancel();
        }
    }

    public editTitle(): void {
        this.showProblems = false;
        if (this.document && this.document.info && this.document.info.title) {
            this.newTitle = this.document.info.title;
        } else {
            this.newTitle = "";
        }
        this.editMode = true;
    }

    public cancel(): void {
        this.editMode = false;
    }

    public save(): void {
        this.editMode = false;
        console.info("[EditorTitleBarComponent] User changed the title to: " + this.newTitle);
        let command: ICommand = createChangeTitleCommand(this.document, this.newTitle);
        this.commandService.emit(command);
    }

    public isOAI30(): boolean {
        return this.document.is3xDocument();
    }

    public isSwagger2(): boolean {
        return this.document.is2xDocument();
    }

    /**
     * Called when the user selects the main/default element from the master area.
     */
    public selectMain(): void {
        this.selectionService.selectRoot(this.document);
    }

    /**
     * Returns the classes that should be applied to the "main" selection item.
     * @return
     */
    public mainClasses(): string {
        let classes: string[] = [];
        if (this.isMainSelected()) {
            classes.push("selected");
        }
        if (this.isOAI30()) {
            classes.push("oai30");
        }
        if (this.isSwagger2()) {
            classes.push("oai20");
        }
        if (this.showProblems) {
            classes.push("expanded");
        }
        return classes.join(' ') + " " + this.collaboratorSelectionClasses(this.document);
    }

    /**
     * Returns the selection style to use for the given (potentially selected) node.
     * @param item
     * @return
     */
    public collaboratorSelectionClasses(item: OasNode): string {
        if (item) {
            let user: ApiEditorUser = ModelUtils.isSelectedByCollaborator(item);
            if (user != null && user.attributes["id"]) {
                return user.attributes["id"];
            }
        }
        return "";
    }

    /**
     * Returns true if the main node should be selected.
     * @return
     */
    public isMainSelected(): boolean {
        return ModelUtils.isSelected(this.document);
    }

    /**
     * Called when the user clicks somewhere in the document.  Used to close the context
     * menu if it is open.
     */
    @HostListener("document:click", ["$event"])
    public onDocumentClick(): void {
    }

    /**
     * Returns the title of the API.
     * @return
     */
    public title(): string {
        if (this.hasTitle()) {
            return this.document.info.title;
        }
        return "No API Title";
    }

    /**
     * Returns true if the API has a title.
     * @return
     */
    public hasTitle(): boolean {
        if (this.document && this.document.info && this.document.info.title) {
            return true;
        }
        return false;
    }

    /**
     * Called when the user clicks the Bell icon to show the list of problems.
     */
    public toggleProblemDrawer(): void {
        this.showProblems = !this.showProblems;
    }

    /**
     * Called to close the problem drawer.
     */
    public closeProblemDrawer(): void {
        this.showProblems = false;
    }
}
