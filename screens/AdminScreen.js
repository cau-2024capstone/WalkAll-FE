import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { UserContext } from "../store/context/userContext";

const AdminScreen = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API_BASE_URL } = useContext(UserContext);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/inquiries`)
      .then((response) => response.json())
      .then((data) => {
        setInquiries(data);
        console.log("Inquiries:", data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleApprove = (inquiryIdf) => {
    // 문의 내역에서 제거
    setInquiries((prevInquiries) =>
      prevInquiries.filter((inquiry) => inquiry.idf !== inquiryIdf)
    );
    // 승인 API 호출
    fetch(`${API_BASE_URL}/admin/inquiries/${inquiryIdf}/approve`, {
      method: "GET",
    }).catch((error) => {
      console.error(error);
    });
  };

  const handleReject = (inquiryIdf) => {
    // 문의 내역에서 제거
    setInquiries((prevInquiries) =>
      prevInquiries.filter((inquiry) => inquiry.idf !== inquiryIdf)
    );
    // 거절 API 호출
    fetch(`${API_BASE_URL}/admin/inquiries/${inquiryIdf}/reject`, {
      method: "GET",
    }).catch((error) => {
      console.error(error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>관리자용 사용자 문의 내역</Text>

      {inquiries.length === 0 && !loading ? (
        <Text style={styles.noInquiriesText}>문의한 내역이 없습니다</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {inquiries.map((inquiry) => (
            <View key={inquiry.idf} style={styles.inquiryCard}>
              <Text style={styles.userEmail}>{inquiry.requestUserEmail}</Text>
              {console.log(inquiry.requestUserEmail)}
              <Text style={styles.inquiryText}>
                시작점 idf: {inquiry.startNodeIdf}
              </Text>
              <Text style={styles.inquiryText}>
                종료점 idf: {inquiry.endNodeIdf}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprove(inquiry.idf)}
                >
                  <Text style={styles.buttonText}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(inquiry.idf)}
                >
                  <Text style={styles.buttonText}>거절</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 로딩 모달 */}
      {loading && (
        <Modal transparent={true} animationType="fade" visible={loading}>
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={{ marginTop: 10 }}>로딩 중...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(254, 254, 254, 1)", // White
  },
  title: {
    paddingTop: 60,
    paddingBottom: 15,
    textAlign: "center",
    fontSize: 23,
    color: "rgba(23, 29, 27, 1)", // Dark green
    fontWeight: "bold",
  },
  noInquiriesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
  },
  inquiryCard: {
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: "rgba(244, 251, 248, 1)", // Light ivory
    borderRadius: 10,
    padding: 10,
    paddingTop: 30, // 이메일과 겹치지 않도록 패딩 추가
    shadowColor: "rgba(0, 0, 0, 1)", // Black shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  userEmail: {
    position: "absolute",
    right: 10,
    top: 10,
    fontWeight: "bold",
  },
  inquiryText: {
    fontSize: 16,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "rgba(74, 143, 62, 1)", // Dark green
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(52, 121, 40, 1)", // Darker green
    width: 80,
  },
  rejectButton: {
    backgroundColor: "rgba(255, 0, 0, 1)", // Red
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(200, 0, 0, 1)", // Darker red
    width: 80,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000040", // Semi-transparent background
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
