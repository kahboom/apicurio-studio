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
import {GitHubRepository} from "../../../../../models/github-repository.model";


@Component({
    moduleId: module.id,
    selector: "github-resource",
    templateUrl: "github-resource.component.html"
})
export class GitHubResourceComponent implements OnInit {

    @Output() onChange = new EventEmitter<any>();
    @Output() onValid = new EventEmitter<boolean>();

    public model: any = {
        org: null,
        repo: null,
        branch: "master",
        resource: null
    };
    public _orgOptions: DropDownOption[] = [];
    public _repoOptions: DropDownOption[] = [];
    public _branchOptions: DropDownOption[] = [
        {
            name: "master",
            value: "master"
        }
    ];
    public gettingOrgs: boolean = false;
    public gettingRepos: boolean = false;
    public gettingBranches: boolean = false;

    /**
     * Constructor.
     * @param LinkedAccountsService linkedAcounts
     */
    constructor(private linkedAcounts: LinkedAccountsService) {}

    public ngOnInit(): void {
        console.info("[GitHubResourceComponent] ngOnInit()");
        // Get the list of orgs (async)
        this.gettingOrgs = true;
        this.onValid.emit(false);
        this.linkedAcounts.getAccountOrganizations("GitHub").then( orgs => {
            orgs.sort( (org1, org2) => {
                return org1.id.localeCompare(org2.id);
            });
            this._orgOptions = [];
            orgs.forEach( org => {
                if (org.userOrg) {
                    this._orgOptions.push({
                        name: org.id,
                        value: org.id
                    });
                    this._orgOptions.push({
                        divider: true
                    });
                }
            });
            orgs.forEach( org => {
                if (!org.userOrg) {
                    this._orgOptions.push({
                        name: org.id,
                        value: org.id
                    });
                }
            });
            this.gettingOrgs = false;
        }).catch( error => {
            // TODO handle an error in some way!
            this.gettingOrgs = false;
            console.error(error);
        });
    }

    public orgOptions(): DropDownOption[] {
        return this._orgOptions;
    }

    public changeOrg(value: string): void {
        this.model.org = value;
        this.model.repo = null;
        this.model.branch = "master";

        this.onChange.emit(this.model);
        this.onValid.emit(this.isValid());

        this.gettingRepos = true;
        this.linkedAcounts.getAccountRepositories("GitHub", this.model.org).then( _repos => {
            let repos: GitHubRepository[] = _repos as GitHubRepository[];
            repos.sort( (repo1, repo2) => {
                return repo1.name.localeCompare(repo2.name);
            });
            this._repoOptions = [];
            repos.forEach( repo => {
                this._repoOptions.push({
                    name: repo.name,
                    value: repo.name
                });
            })
            this.gettingRepos = false;
        }).catch(error => {
            // TODO handle an error!
            this.gettingRepos = false;
            console.error(error);
        });
    }

    public repoOptions(): DropDownOption[] {
        return this._repoOptions;
    }

    public changeRepo(value: string): void {
        this.model.repo = value;
        this.model.branch = "master";

        this.onChange.emit(this.model);
        this.onValid.emit(this.isValid());

        this.gettingBranches = true;
        this.linkedAcounts.getAccountBranches("GitHub", this.model.org, this.model.repo).then( branches => {
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
        return this.model.org != null &&
            this.model.org != undefined &&
            this.model.org.length > 0 &&
            this.model.repo != null &&
            this.model.repo != undefined &&
            this.model.repo.length > 0 &&
            this.model.branch != null &&
            this.model.branch != undefined &&
            this.model.branch.length > 0 &&
            this.model.resource != null &&
            this.model.resource != undefined &&
            this.model.resource.length > 0;
    }
}
