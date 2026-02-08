"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStateHelpers = useStateHelpers;
function useStateHelpers(store) {
    var state = store.state;
    function getUnitById(id) {
        return state.unitMap[id];
    }
    function getSideById(id) {
        return state.sideMap[id];
    }
    function getSideGroupById(id) {
        return state.sideGroupMap[id];
    }
    return {
        getUnitById: getUnitById,
        getSideById: getSideById,
        getSideGroupById: getSideGroupById,
    };
}
