import { notifications } from "@mantine/notifications";

export function showSuccess(message, title = "Success") {
    notifications.show({
        title,
        message,
        color: "teal",
    });
}

export function showError(message, title = "Error") {
    notifications.show({
        title,
        message,
        color: "red",
    });
}

export function showInfo(message, title = "Info") {
    notifications.show({
        title,
        message,
        color: "blue",
    });
}