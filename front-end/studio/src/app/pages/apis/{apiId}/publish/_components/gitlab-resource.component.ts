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

import {Component, EventEmitter, Inject, OnInit, Output} from "@angular/core";
import {LinkedAccountsService} from "../../../../../services/accounts.service";
import {DropDownOption} from "../../../../../components/common/drop-down.component";


@Component({
    moduleId: module.id,
    selector: "gitlab-resource",
    templateUrl: "gitlab-resource.component.html"
})
export class GitLabResourceComponent implements OnInit {

    @Output() onChange = new EventEmitter<any>();
    @Output() onValid = new EventEmitter<boolean>();

    public model: any = {
        group: null,
        project: null,
        branch: "master",
        resource: null
    };
    public _groupOptions: DropDownOption[] = [];
    public _projectOptions: DropDownOption[] = [];
    public _branchOptions: DropDownOption[] = [
        {
            name: "master",
            value: "master"
        }
    ];
    public gettingGroups: boolean = false;
    public gettingProjects: boolean = false;
    public gettingBranches: boolean = false;

    /**
     * Constructor.
     * @param LinkedAccountsService linkedAcounts
     */
    constructor( private linkedAcounts: LinkedAccountsService) {}

    public ngOnInit(): void {
        console.info("[GitLabResourceComponent] ngOnInit()");
        // Get the list of groups (async)
        this.gettingGroups = true;
        this.onValid.emit(false);
        this.linkedAcounts.getAccountGroups("GitLab").then( groups => {
            groups.sort( (group1, group2) => {
                return group1.name.localeCompare(group2.name);
            });
            this._groupOptions = [];
            groups.forEach( group => {
                this._groupOptions.push({
                    name: group.name,
                    value: group.name
                });
            });
            this.gettingGroups = false;
        }).catch( error => {
            // TODO handle an error in some way!
            this.gettingGroups = false;
            console.error(error);
        });
    }

    public groupOptions(): DropDownOption[] {
        return this._groupOptions;
    }

    public changeGroup(value: string): void {
        this.model.group = value;
        this.model.project = null;
        this.model.branch = "master";

        this.onChange.emit(this.model);
        this.onValid.emit(this.isValid());

        this.gettingProjects = true;
        this.linkedAcounts.getAccountProjects("GitLab", this.model.group).then( projects => {
            projects.sort( (project1, project2) => {
                return project1.name.localeCompare(project2.name);
            });
            this._projectOptions = [];
            projects.forEach( project => {
                this._projectOptions.push({
                    name: project.name,
                    value: project.name
                });
            })
            this.gettingProjects = false;
        }).catch(error => {
            // TODO handle an error!
            this.gettingProjects = false;
            console.error(error);
        });
    }

    public projectOptions(): DropDownOption[] {
        return this._projectOptions;
    }

    public changeProject(value: string): void {
        this.model.project = value;
        this.model.branch = "master";

        this.onChange.emit(this.model);
        this.onValid.emit(this.isValid());

        this.gettingBranches = true;
        this.linkedAcounts.getAccountBranches("GitLab", this.model.group, this.model.project).then( branches => {
            branches.sort( (branch1, branch2) => {
                return branch1.name.localeCompare(branch2.name);
            });
            this._branchOptions = [];
            branches.forEach( branch => {
                this._branchOptions.push({
                    name: branch.name,
                    value: branch.name
                });
            })
            this.gettingBranches = false;
        }).catch(error => {
            // TODO handle an error!
            this.gettingBranches = false;
            console.error(error);
        });

    }

    public branchOptions(): DropDownOption[] {
        return this._branchOptions;
    }

    public changeBranch(value: string): void {
        this.model.branch = value;

        this.onChange.emit(this.model);
        this.onValid.emit(this.isValid());
    }

    public resourceChanged(): void {
        this.onChange.emit(this.model);
        this.onValid.emit(this.isValid());
    }

    private isValid(): boolean {
        return this.model.group != null &&
            this.model.group != undefined &&
            this.model.group.length > 0 &&
            this.model.project != null &&
            this.model.project != undefined &&
            this.model.project.length > 0 &&
            this.model.branch != null &&
            this.model.branch != undefined &&
            this.model.branch.length > 0 &&
            this.model.resource != null &&
            this.model.resource != undefined &&
            this.model.resource.length > 0;
    }
}
