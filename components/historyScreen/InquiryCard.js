// components/historyScreen/InquiryCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import rootStyles from "../../styles/StyleGuide";

function InquiryCard({ inquiry }) {
  const { status, actionType, startNodeIdf, endNodeIdf } = inquiry;

  let statusColor;
  switch (status) {
    case "문의 처리중":
      statusColor = "orange";
      break;
    case "문의 승인됨":
      statusColor = "green";
      break;
    case "문의 거절됨":
      statusColor = "red";
      break;
    default:
      statusColor = "gray";
  }

  return (
    <View style={localStyles.cardContainer}>
      <View style={localStyles.statusContainer}>
        <Text style={[localStyles.statusText, { color: statusColor }]}>
          {status}
        </Text>
      </View>
      <Text style={localStyles.infoText}>Action: {actionType}</Text>
      <Text style={localStyles.infoText}>Start Node: {startNodeIdf}</Text>
      <Text style={localStyles.infoText}>End Node: {endNodeIdf}</Text>
    </View>
  );
}

export default InquiryCard;

const localStyles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    paddingVertical: "4%",
    paddingHorizontal: "5%",
    marginBottom: "5%",
    backgroundColor: rootStyles.colors.white,
    borderRadius: 15,
    shadowColor: rootStyles.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statusContainer: {
    marginBottom: "2%",
  },
  statusText: {
    fontSize: rootStyles.fontStyles.subTitle.fontSize,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: rootStyles.fontStyles.text.fontSize,
    marginBottom: "1%",
  },
});
