import React from "react";
import { PluginUIState } from "./plugin-ui.state";
import {
    Caption,
    Divider,
    DividerClassNameContract,
    Label,
    LabelClassNameContract,
    Paragraph,
    Select,
    SelectOption,
} from "@microsoft/fast-components-react-msft";
import { stringById } from "./strings";
import { isPluginMessageEvent, PluginMessageData } from "../messaging/common";
import { isSetUIStateMessage } from "../messaging/canvas";
import { SET_UI_STATE } from "src/messaging/canvas";
import {
    ComponentStyleSheet,
    DesignSystemProvider,
} from "@microsoft/fast-jss-manager-react";
import {
    DesignSystem,
    DesignSystemDefaults,
} from "@microsoft/fast-components-styles-msft";

const designSystem: DesignSystem = { ...DesignSystemDefaults, density: -2 };
const dividerStyleOverrides: ComponentStyleSheet<
    DividerClassNameContract,
    DesignSystem
> = {
    divider: {
        margin: "20px 0 8px 0",
    },
};

const recipeLabelStyleOverrides: ComponentStyleSheet<
    LabelClassNameContract,
    DesignSystem
> = {
    label: {
        margin: "8px 0 2px",
    },
};

/**
 * At this point, this is essentially a controlled component.
 * State will be controlled by the main application and serilaized
 * state will be passed to this component to be parsed, set, and rendered
 *
 * There may be some local state we want to track that doesn't concern the primary application,
 * but for now we'll keep all of the app logic in one place and merely make this component
 * reflect that external state.
 */
export class PluginUI extends React.Component<{}, PluginUIState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            activeNodeType: null,
            fills: [],
            activeFill: null,
            strokes: [],
            activeStroke: null,
            textFills: [],
            activeTextFill: null,
        };

        // Register message listener to react to messages from main.ts
        window.onmessage = this.handleOnMessage;
    }

    public render(): JSX.Element {
        const { fills, strokes, textFills }: PluginUIState = this.state;

        return (
            <DesignSystemProvider designSystem={designSystem}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        {fills.length + strokes.length + textFills.length === 0 ? (
                            <Paragraph>No configurable properties on this node</Paragraph>
                        ) : (
                            this.renderEditingUi()
                        )}
                    </div>
                    <div>
                        <Divider jssStyleSheet={dividerStyleOverrides} />
                        <Caption>{this.state.activeNodeType}</Caption>
                    </div>
                </div>
            </DesignSystemProvider>
        );
    }

    public renderNoValidSelection(): JSX.Element {
        return <Paragraph>{stringById("noValidElementSelected")}</Paragraph>;
    }

    private handleOnMessage = (e: MessageEvent): void => {
        if (!isPluginMessageEvent(e)) {
            return; // Exit if the MessageEvent should not be handled by our UI
        } else {
            const message: PluginMessageData<any> = JSON.parse(e.data.pluginMessage);

            if (isSetUIStateMessage(message)) {
                this.setState(message.value);
            }
        }
    };

    private renderEditingUi(): JSX.Element {
        return (
            <div>
                {this.state.fills.length > 0
                    ? this.renderRecipeSelector({
                          label: "Fill",
                          id: "fill",
                          selectOptions: this.state.fills,
                          active: this.state.activeFill,
                          action: "TODO:SET_FILL_ACTION",
                      })
                    : null}
                {this.state.strokes.length > 0
                    ? this.renderRecipeSelector({
                          label: "Stroke",
                          id: "stroke",
                          selectOptions: this.state.strokes,
                          active: this.state.activeStroke,
                          action: "TODO:SET_STROKE_ACTION",
                      })
                    : null}
                {this.state.textFills.length > 0
                    ? this.renderRecipeSelector({
                          label: "Fill",
                          id: "text-fill",
                          selectOptions: this.state.textFills,
                          active: this.state.activeTextFill,
                          action: "TODO:SET_TEXT_FILL_ACTION",
                      })
                    : null}
            </div>
        );
    }

    private renderRecipeSelector(options: {
        label: string;
        id: string;
        selectOptions: string[];
        active: string | null;
        action: any;
    }): JSX.Element {
        const defaultSelected: string = "unset";

        return (
            <React.Fragment>
                <Label htmlFor={options.id} jssStyleSheet={recipeLabelStyleOverrides}>
                    {options.label}
                </Label>
                <Select
                    id={options.id}
                    selectedItems={[
                        options.active === null ? defaultSelected : options.active,
                    ]}
                >
                    {[defaultSelected]
                        .concat(options.selectOptions)
                        .map(this.renderRecipeOption)}
                </Select>
            </React.Fragment>
        );
    }

    private renderRecipeOption(option: string): JSX.Element {
        return <SelectOption id={option} key={option} value={option} children={option} />;
    }
}
