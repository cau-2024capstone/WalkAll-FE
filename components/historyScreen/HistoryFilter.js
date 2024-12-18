// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
// } from "react-native";
// import rootStyles from "../../styles/StyleGuide";

// const HistoryFilter = ({ onApply, onCancel }) => {
//   const [selectedFilters, setSelectedFilters] = useState({
//     distance: { min: "", max: "" },
//     type: "all",
//     road: [],
//     time: { min: "", max: "" },
//   });

//   const handleFilterApply = () => {
//     onApply(selectedFilters); // 필터 조건을 부모 컴포넌트로 전달
//   };

//   return (
//     <View style={localStyles.container}>
//       <View style={localStyles.header}>
//         <Text style={localStyles.title}>히스토리 필터</Text>
//         <TouchableOpacity onPress={onCancel}>
//           <Text style={localStyles.cancelText}>취소</Text>
//         </TouchableOpacity>
//       </View>

//       {/* 총 거리 필터 */}
//       <View style={localStyles.section}>
//         <Text style={localStyles.sectionTitle}>총 거리</Text>
//         <View style={localStyles.inputRow}>
//           <TextInput
//             style={localStyles.inputBox}
//             placeholder="Min"
//             keyboardType="numeric"
//             value={selectedFilters.distance.min}
//             onChangeText={(value) =>
//               setSelectedFilters((prev) => ({
//                 ...prev,
//                 distance: { ...prev.distance, min: value },
//               }))
//             }
//           />
//           <TextInput
//             style={localStyles.inputBox}
//             placeholder="Max"
//             keyboardType="numeric"
//             value={selectedFilters.distance.max}
//             onChangeText={(value) =>
//               setSelectedFilters((prev) => ({
//                 ...prev,
//                 distance: { ...prev.distance, max: value },
//               }))
//             }
//           />
//         </View>
//       </View>

//       {/* 왕복/편도 필터 */}
//       <View style={localStyles.section}>
//         <Text style={localStyles.sectionTitle}>왕복 유무</Text>
//         <View style={localStyles.toggleGroup}>
//           <TouchableOpacity
//             style={[
//               localStyles.toggleOption,
//               selectedFilters.type === "왕복" && localStyles.toggleOptionActive,
//             ]}
//             onPress={() =>
//               setSelectedFilters((prev) => ({ ...prev, type: "왕복" }))
//             }
//           >
//             <Text
//               style={[
//                 localStyles.toggleOptionText,
//                 selectedFilters.type === "왕복" &&
//                   localStyles.toggleOptionTextActive,
//               ]}
//             >
//               왕복
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               localStyles.toggleOption,
//               selectedFilters.type === "편도" && localStyles.toggleOptionActive,
//             ]}
//             onPress={() =>
//               setSelectedFilters((prev) => ({ ...prev, type: "편도" }))
//             }
//           >
//             <Text
//               style={[
//                 localStyles.toggleOptionText,
//                 selectedFilters.type === "편도" &&
//                   localStyles.toggleOptionTextActive,
//               ]}
//             >
//               편도
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* 도로 유형 필터 */}
//       <View style={localStyles.section}>
//         <Text style={localStyles.sectionTitle}>도로 유형</Text>
//         {["편한길", "골목길", "다이어트길", "자연친화길"].map((road, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[
//               localStyles.checkboxContainer,
//               selectedFilters.road.includes(road) &&
//                 localStyles.checkboxSelected,
//             ]}
//             onPress={() => toggleRoadType(road)}
//           >
//             <Text style={localStyles.checkboxLabel}>{road}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* 실 소요시간 필터 */}
//       <View style={localStyles.section}>
//         <Text style={localStyles.sectionTitle}>실 소요시간</Text>
//         <View style={localStyles.inputRow}>
//           <TextInput
//             style={localStyles.inputBox}
//             placeholder="Min"
//             keyboardType="numeric"
//             value={selectedFilters.time.min}
//             onChangeText={(value) =>
//               setSelectedFilters((prev) => ({
//                 ...prev,
//                 time: { ...prev.time, min: value },
//               }))
//             }
//           />
//           <TextInput
//             style={localStyles.inputBox}
//             placeholder="Max"
//             keyboardType="numeric"
//             value={selectedFilters.time.max}
//             onChangeText={(value) =>
//               setSelectedFilters((prev) => ({
//                 ...prev,
//                 time: { ...prev.time, max: value },
//               }))
//             }
//           />
//         </View>
//       </View>

//       {/* 필터 적용 버튼 */}
//       <TouchableOpacity
//         style={localStyles.applyButton}
//         onPress={handleFilterApply}
//       >
//         <Text style={localStyles.applyButtonText}>적용</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default HistoryFilter;

// const localStyles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: rootStyles.colors.white,
//     borderRadius: 16,
//     marginHorizontal: 20,
//     shadowColor: rootStyles.colors.black,
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 0 },
//     shadowRadius: 15,
//     elevation: 10,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   title: {
//     ...rootStyles.fontStyles.subTitle,
//     color: rootStyles.colors.gray6,
//   },
//   cancelText: {
//     color: rootStyles.colors.red,
//     fontWeight: "bold",
//   },
//   section: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     marginBottom: 8,
//     ...rootStyles.fontStyles.text,
//     color: rootStyles.colors.gray6,
//   },
//   inputRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   inputBox: {
//     width: "48%",
//     height: 36,
//     backgroundColor: rootStyles.colors.gray1,
//     borderRadius: 4,
//     paddingHorizontal: 8,
//     justifyContent: "center",
//   },
//   toggleGroup: {
//     flexDirection: "row",
//     backgroundColor: rootStyles.colors.gray1,
//     borderRadius: 20,
//     padding: 4,
//   },
//   toggleOption: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 8,
//     borderRadius: 16,
//   },
//   toggleOptionActive: {
//     backgroundColor: rootStyles.colors.green3,
//   },
//   toggleOptionText: {
//     ...rootStyles.fontStyles.text,
//     color: rootStyles.colors.gray6,
//   },
//   toggleOptionTextActive: {
//     color: rootStyles.colors.white,
//   },
//   checkboxContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 8,
//     borderWidth: 1,
//     borderColor: rootStyles.colors.gray3,
//     borderRadius: 4,
//     marginBottom: 8,
//   },
//   checkboxSelected: {
//     borderColor: rootStyles.colors.green3,
//     backgroundColor: rootStyles.colors.green1,
//   },
//   checkboxLabel: {
//     ...rootStyles.fontStyles.text,
//     color: rootStyles.colors.gray6,
//   },
//   applyButton: {
//     backgroundColor: rootStyles.colors.green5,
//     paddingVertical: 12,
//     borderRadius: 16,
//     alignItems: "center",
//   },
//   applyButtonText: {
//     ...rootStyles.fontStyles.text,
//     color: rootStyles.colors.white,
//   },
// });
