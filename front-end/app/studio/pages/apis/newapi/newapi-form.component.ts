import {Component, Inject, EventEmitter, Output} from '@angular/core';
import {IApisService} from "../../../services/apis.service";
import {Api} from "../../../models/api.model";


@Component({
    moduleId: module.id,
    selector: 'newapi-form',
    templateUrl: 'newapi-form.component.html',
    styleUrls: ['newapi-form.component.scss']
})
export class NewApiFormComponent {

    @Output() onCreateApi = new EventEmitter<Api>();

    repositoryTypes: string[];
    model: Api;
    creatingApi: boolean;
    discoveringApi: boolean;
    dragging: boolean;

    /**
     * Constructor.
     * @param apis
     */
    constructor(@Inject(IApisService) private apis: IApisService) {
        this.repositoryTypes = apis.getSupportedRepositoryTypes();
        this.model = new Api();
        this.model.repositoryResource.repositoryType = this.repositoryTypes[0];
        this.creatingApi = false;
        this.discoveringApi = false;
        this.dragging = false;
    }

    /**
     * Called when the user clicks the "Create API" submit button on the form.
     */
    public createApi(): void {
        this.creatingApi = true;
        this.onCreateApi.emit(this.model);
    }

    public onDragOver(event: DragEvent): void {
        if (!this.dragging) {
            this.dragging = true;
        }
        event.preventDefault();
    }

    public onDrop(event: DragEvent): void {
        let dropData: string = event.dataTransfer.getData("text");
        this.dragging = false;
        event.preventDefault();

        if (dropData && dropData.startsWith("http")) {
            this.discoveringApi = true;
            this.apis.discoverApi(dropData).then(api => {
                this.model = api;
                this.discoveringApi = false;
            }).catch( reason => alert(reason) );
        }
    }

    public onDragEnd(event: DragEvent): void {
        this.dragging = false;
    }

}
