import { inRange } from "lodash-es";
import { PaletteRGB } from "../palette";
import { Swatch } from "../swatch";
import { isDark } from "../utilities/is-dark";

/**
 * @internal
 */
export function accentFill(
    palette: PaletteRGB,
    neutralPaletteRGB: PaletteRGB,
    reference: Swatch,
    textColor: Swatch,
    contrastTarget: number,
    hoverDelta: number,
    activeDelta: number,
    focusDelta: number,
    selectedDelta: number,
    neutralFillRestDelta: number,
    neutralFillHoverDelta: number,
    neutralFillActiveDelta: number
) {
    const accent = palette.source;
    const referenceIndex = neutralPaletteRGB.closestIndexOf(reference);
    const swapThreshold = Math.max(
        neutralFillRestDelta,
        neutralFillHoverDelta,
        neutralFillActiveDelta
    );
    const direction = referenceIndex >= swapThreshold ? -1 : 1;
    const paletteLength = palette.swatches.length;
    const maxIndex = paletteLength - 1;
    const accentIndex = palette.closestIndexOf(accent);
    let accessibleOffset = 0;

    while (
        accessibleOffset < direction * hoverDelta &&
        inRange(accentIndex + accessibleOffset + direction, 0, paletteLength) &&
        textColor.contrast(palette.get(accentIndex + accessibleOffset + direction)) >=
            contrastTarget &&
        inRange(accentIndex + accessibleOffset + direction + direction, 0, maxIndex)
    ) {
        accessibleOffset += direction;
    }

    const hoverIndex = accentIndex + accessibleOffset;
    const restIndex = hoverIndex + direction * -1 * hoverDelta;
    const activeIndex = restIndex + direction * activeDelta;
    const focusIndex = restIndex + direction * focusDelta;
    const selectedIndex =
        restIndex + (isDark(reference) ? selectedDelta * -1 : selectedDelta);

    return {
        rest: palette.get(restIndex),
        hover: palette.get(hoverIndex),
        active: palette.get(activeIndex),
        focus: palette.get(focusIndex),
        selected: palette.get(selectedIndex),
    };
}